<?php

use App\Mail\SubmissionReceived;
use App\Models\Category;
use App\Models\SellerSubmission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

/*
 * POST /api/submissions — the public seller-submission endpoint (J3.01, expanded by DR-8).
 * Locks the frozen response shape, the validation rules, the nullable|url:https rule, and the
 * SubmissionReceived admin dispatch. Assertions are on membership / field presence / persisted rows
 * only — no engine-specific behaviour.
 *
 * DR-8 made the endpoint MULTIPART and made the uploads + category + payout + terms REQUIRED, so the
 * fixture below carries them. Every original assertion is preserved unchanged.
 */

beforeEach(function () {
    // Uploads never touch the real disk in tests.
    Storage::fake('deliverables');
    Storage::fake('public');
});

function validSubmissionPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jane Seller',
        'email' => 'jane@example.com',
        'project_name' => 'Widget Pro',
        'category_id' => Category::factory()->create()->id,
        'url' => 'https://github.com/acme/widget',
        'asking_price_cents' => 500000,
        'mrr_cents' => 4200,
        'description' => 'A tidy micro-SaaS for review.',

        // Required uploads (DR-8).
        'deliverable' => UploadedFile::fake()->create('code.zip', 20, 'application/zip'),
        'readme' => UploadedFile::fake()->create('verify.txt', 4, 'text/plain'),
        'images' => [UploadedFile::fake()->image('screenshot.png')],

        // Payout destination (sensitive).
        'payout_method' => SellerSubmission::PAYOUT_BANK,
        'payout_holder_name' => 'Jane Seller',
        'payout_identifier' => 'DE89370400440532013000',

        'terms_accepted' => true,
    ], $overrides);
}

/** Multipart POST (files can't ride on postJson), still asking for a JSON response. */
function postSubmission(array $payload)
{
    return test()->post('/api/submissions', $payload, ['Accept' => 'application/json']);
}

it('creates a submission and returns the frozen 201 shape', function () {
    Mail::fake();

    $res = postSubmission(validSubmissionPayload())->assertCreated();

    $res->assertJsonStructure(['data' => ['id', 'status'], 'message'])
        ->assertJsonPath('data.status', 'new')
        ->assertJsonPath('message', 'Submission received.');

    // Exactly {id,status} in data — nothing else leaks back to the anonymous submitter.
    expect(array_keys($res->json('data')))->toBe(['id', 'status']);
});

it('persists a seller_submissions row with status=new', function () {
    Mail::fake();

    $res = postSubmission(validSubmissionPayload([
        'email' => 'persist@example.com',
    ]))->assertCreated();

    $row = SellerSubmission::find($res->json('data.id'));

    expect($row)->not->toBeNull()
        ->and($row->status)->toBe(SellerSubmission::STATUS_NEW)
        ->and($row->email)->toBe('persist@example.com')
        ->and($row->asking_price_cents)->toBe(500000);
});

it('dispatches SubmissionReceived to the admin on success', function () {
    Mail::fake();

    postSubmission(validSubmissionPayload())->assertCreated();

    Mail::assertSent(SubmissionReceived::class, fn (SubmissionReceived $mail): bool =>
        $mail->hasTo(config('mail.from.address')));
});

it('rejects missing required fields with 422', function () {
    Mail::fake();

    postSubmission([])
        ->assertStatus(422)
        ->assertJsonValidationErrors([
            'name', 'email', 'project_name', 'description', 'asking_price_cents', 'mrr_cents',
        ]);

    Mail::assertNothingSent();
});

it('rejects an invalid email with 422', function () {
    postSubmission(validSubmissionPayload(['email' => 'not-an-email']))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('requires asking_price_cents and mrr_cents to be integers >= 0', function () {
    // non-integer
    postSubmission(validSubmissionPayload(['asking_price_cents' => 'lots']))
        ->assertStatus(422)->assertJsonValidationErrors(['asking_price_cents']);
    // negative
    postSubmission(validSubmissionPayload(['mrr_cents' => -1]))
        ->assertStatus(422)->assertJsonValidationErrors(['mrr_cents']);
    // zero is allowed (min:0)
    Mail::fake();
    postSubmission(validSubmissionPayload(['email' => 'zero@example.com', 'mrr_cents' => 0]))
        ->assertCreated();
});

it('rejects non-HTTPS url values', function () {
    foreach (['http://insecure.example.com', 'ftp://files.example.com', 'ssh://git@example.com', 'not a url'] as $bad) {
        postSubmission(validSubmissionPayload(['url' => $bad]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['url']);
    }
});

it('accepts an https url, a null url, and an omitted url', function () {
    Mail::fake();

    // https
    postSubmission(validSubmissionPayload(['email' => 'https@example.com', 'url' => 'https://ok.example.com']))
        ->assertCreated();

    // explicit null
    postSubmission(validSubmissionPayload(['email' => 'null@example.com', 'url' => null]))
        ->assertCreated();

    // omitted entirely
    $payload = validSubmissionPayload(['email' => 'omit@example.com']);
    unset($payload['url']);
    postSubmission($payload)->assertCreated();
});
