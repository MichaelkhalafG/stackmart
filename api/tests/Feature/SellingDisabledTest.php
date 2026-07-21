<?php

use App\Models\Category;
use App\Models\SellerSubmission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

/*
 * The server-side half of buyer-only mode (config/features.php `selling`, env ENABLE_SELLING).
 *
 * Hiding the /sell page in the frontend does nothing for POST /api/submissions — a public,
 * unauthenticated endpoint that accepts a 100 MB ZIP plus a README and eight images per request and
 * emails the admin each time. With selling off it must be gone from the API's point of view too.
 */

beforeEach(function () {
    Storage::fake('deliverables');
    Storage::fake('public');
    Mail::fake();
});

/** The same fixtures the DR-8 upload tests use — known-good against the mime/size rules. */
function submissionPayload(int $categoryId): array
{
    return [
        'name' => 'Ada Seller',
        'email' => 'ada@example.com',
        'project_name' => 'Cronbase',
        'category_id' => $categoryId,
        'asking_price_cents' => 1500000,
        'mrr_cents' => 620000,
        'description' => 'A scheduling SaaS with real customers.',
        'deliverable' => UploadedFile::fake()->create('code.zip', 20, 'application/zip'),
        'readme' => UploadedFile::fake()->create('verify.txt', 4, 'text/plain'),
        'images' => [UploadedFile::fake()->image('one.png')],
        'payout_method' => SellerSubmission::PAYOUT_BANK,
        'payout_holder_name' => 'Ada Seller',
        'payout_identifier' => 'DE89370400440532013000',
        'terms_accepted' => true,
    ];
}

it('404s the submission endpoint when selling is disabled', function () {
    config(['features.selling' => false]);

    $category = Category::factory()->create();

    test()->post('/api/submissions', submissionPayload($category->id), ['Accept' => 'application/json'])
        ->assertNotFound();

    // Nothing recorded, nothing stored, nobody emailed — the gate runs before validation, so the
    // upload is never processed at all.
    expect(SellerSubmission::count())->toBe(0)
        ->and(Storage::disk('deliverables')->allFiles())->toBe([]);

    Mail::assertNothingSent();
});

it('accepts a submission when selling is enabled', function () {
    config(['features.selling' => true]);

    $category = Category::factory()->create();

    test()->post('/api/submissions', submissionPayload($category->id), ['Accept' => 'application/json'])
        ->assertCreated();

    expect(SellerSubmission::count())->toBe(1);
});
