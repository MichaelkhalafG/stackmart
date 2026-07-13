<?php

use App\Models\Category;
use App\Models\SellerSubmission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

/*
 * DR-8 — the expanded seller submission: required uploads, private storage, and the sensitive-data
 * guarantees (nothing leaks in the 201 body; the payout identifier is encrypted at rest).
 *
 * Engine-agnostic: assertions are on validation keys, stored paths, and field presence.
 */

beforeEach(function () {
    Storage::fake('deliverables');
    Storage::fake('public');
    Mail::fake();
});

function uploadPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jane Seller',
        'email' => 'jane@example.com',
        'project_name' => 'Widget Pro',
        'category_id' => Category::factory()->create()->id,
        'url' => 'https://widget.example.com',
        'asking_price_cents' => 500000,
        'mrr_cents' => 4200,
        'description' => 'A tidy micro-SaaS for review.',
        'deliverable' => UploadedFile::fake()->create('code.zip', 20, 'application/zip'),
        'readme' => UploadedFile::fake()->create('verify.txt', 4, 'text/plain'),
        'images' => [UploadedFile::fake()->image('one.png')],
        'payout_method' => SellerSubmission::PAYOUT_BANK,
        'payout_holder_name' => 'Jane Seller',
        'payout_identifier' => 'DE89370400440532013000',
        'payout_bank_name' => 'Example Bank',
        'terms_accepted' => true,
    ], $overrides);
}

function postUpload(array $payload)
{
    return test()->post('/api/submissions', $payload, ['Accept' => 'application/json']);
}

it('stores the zip, the readme and the images on the PRIVATE disk', function () {
    $res = postUpload(uploadPayload([
        'images' => [
            UploadedFile::fake()->image('one.png'),
            UploadedFile::fake()->image('two.jpg'),
        ],
    ]))->assertCreated();

    $submission = SellerSubmission::find($res->json('data.id'));

    expect($submission->deliverable_path)->not->toBeNull()
        ->and($submission->readme_path)->not->toBeNull()
        ->and($submission->images)->toHaveCount(2);

    // Everything is on the private disk…
    Storage::disk('deliverables')->assertExists($submission->deliverable_path);
    Storage::disk('deliverables')->assertExists($submission->readme_path);
    foreach ($submission->images as $image) {
        Storage::disk('deliverables')->assertExists($image);
    }

    // …and NOTHING is public yet (security S2: images stay private until the listing is created).
    Storage::disk('public')->assertMissing($submission->images[0]);
    expect(Storage::disk('public')->allFiles())->toBe([]);
});

it('never uses the seller-supplied filename as the stored path', function () {
    $res = postUpload(uploadPayload([
        'deliverable' => UploadedFile::fake()->create('../../evil name.zip', 10, 'application/zip'),
    ]))->assertCreated();

    $path = SellerSubmission::find($res->json('data.id'))->deliverable_path;

    expect($path)->toStartWith('submissions/')
        ->and($path)->not->toContain('..')
        ->and($path)->not->toContain('evil');
});

it('requires the deliverable zip, the readme and at least one image', function () {
    $payload = uploadPayload();
    unset($payload['deliverable'], $payload['readme'], $payload['images']);

    postUpload($payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['deliverable', 'readme', 'images']);
});

it('rejects a deliverable that is not really a zip', function () {
    // An executable renamed to .zip — the extension passes, the sniffed mime does not.
    postUpload(uploadPayload([
        'deliverable' => UploadedFile::fake()->create('payload.zip', 10, 'application/x-msdownload'),
    ]))->assertStatus(422)->assertJsonValidationErrors(['deliverable']);

    // A plainly wrong extension is rejected too.
    postUpload(uploadPayload([
        'deliverable' => UploadedFile::fake()->create('code.exe', 10, 'application/x-msdownload'),
    ]))->assertStatus(422)->assertJsonValidationErrors(['deliverable']);
});

it('rejects an oversize deliverable, readme and image', function () {
    // ZIP > 100 MB
    postUpload(uploadPayload([
        'deliverable' => UploadedFile::fake()->create('big.zip', 102401, 'application/zip'),
    ]))->assertStatus(422)->assertJsonValidationErrors(['deliverable']);

    // README > 10 MB
    postUpload(uploadPayload([
        'readme' => UploadedFile::fake()->create('big.txt', 10241, 'text/plain'),
    ]))->assertStatus(422)->assertJsonValidationErrors(['readme']);

    // Image > 5 MB
    postUpload(uploadPayload([
        'images' => [UploadedFile::fake()->image('big.png')->size(5121)],
    ]))->assertStatus(422)->assertJsonValidationErrors(['images.0']);
});

it('rejects a non-image in the gallery and more than 8 images', function () {
    postUpload(uploadPayload([
        'images' => [UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf')],
    ]))->assertStatus(422)->assertJsonValidationErrors(['images.0']);

    $nine = [];
    for ($i = 0; $i < 9; $i++) {
        $nine[] = UploadedFile::fake()->image("shot{$i}.png");
    }

    postUpload(uploadPayload(['images' => $nine]))
        ->assertStatus(422)->assertJsonValidationErrors(['images']);
});

it('requires the category, the payout destination and accepted terms', function () {
    $payload = uploadPayload();
    unset($payload['category_id'], $payload['payout_method'], $payload['payout_holder_name'], $payload['payout_identifier'], $payload['terms_accepted']);

    postUpload($payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['category_id', 'payout_method', 'terms_accepted']);

    // An unknown category is rejected.
    postUpload(uploadPayload(['category_id' => 999999]))
        ->assertStatus(422)->assertJsonValidationErrors(['category_id']);
});

it('leaks NOTHING sensitive in the 201 response body', function () {
    $res = postUpload(uploadPayload())->assertCreated();

    // The frozen shape is exactly {data:{id,status}, message} — unchanged by DR-8.
    expect(array_keys($res->json('data')))->toBe(['id', 'status']);

    $body = $res->getContent();

    foreach ([
        'DE89370400440532013000',   // payout identifier
        'Example Bank',             // bank name
        'submissions/',             // any private path
        'deliverable_path',
        'readme_path',
        'payout_identifier',
        'commission_rate',
    ] as $secret) {
        expect($body)->not->toContain($secret);
    }
});

it('encrypts the payout identifier at rest', function () {
    $res = postUpload(uploadPayload(['payout_identifier' => 'GB33BUKB20201555555555']))->assertCreated();

    $id = $res->json('data.id');

    // The raw column is ciphertext…
    $raw = DB::table('seller_submissions')->where('id', $id)->value('payout_identifier');
    expect($raw)->not->toBeNull()
        ->and($raw)->not->toBe('GB33BUKB20201555555555')
        ->and($raw)->not->toContain('GB33BUKB');

    // …but the model decrypts it transparently for the admin.
    expect(SellerSubmission::find($id)->payout_identifier)->toBe('GB33BUKB20201555555555');
});

it('hides the sensitive fields from model serialization', function () {
    $res = postUpload(uploadPayload())->assertCreated();

    $array = SellerSubmission::find($res->json('data.id'))->toArray();

    expect($array)->not->toHaveKeys([
        'deliverable_path', 'readme_path',
        'payout_method', 'payout_holder_name', 'payout_identifier', 'payout_bank_name',
    ]);
});

it('records the terms acceptance and the flat 20% commission', function () {
    $res = postUpload(uploadPayload())->assertCreated();

    $submission = SellerSubmission::find($res->json('data.id'));

    expect($submission->terms_accepted_at)->not->toBeNull()
        ->and((float) $submission->commission_rate)->toBe(0.2);
});
