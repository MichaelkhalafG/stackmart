<?php

use App\Mail\SubmissionReceived;
use App\Models\SellerSubmission;
use Illuminate\Support\Facades\Mail;

/*
 * POST /api/submissions — the public seller-submission endpoint (J3.01).
 * Locks the frozen response shape, the validation rules, the nullable|url:https
 * rule, and the SubmissionReceived admin dispatch. Assertions are on membership /
 * field presence / persisted rows only — no engine-specific behaviour.
 */

function validSubmissionPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jane Seller',
        'email' => 'jane@example.com',
        'project_name' => 'Widget Pro',
        'url' => 'https://github.com/acme/widget',
        'asking_price_cents' => 500000,
        'mrr_cents' => 4200,
        'description' => 'A tidy micro-SaaS for review.',
    ], $overrides);
}

it('creates a submission and returns the frozen 201 shape', function () {
    Mail::fake();

    $res = $this->postJson('/api/submissions', validSubmissionPayload())->assertCreated();

    $res->assertJsonStructure(['data' => ['id', 'status'], 'message'])
        ->assertJsonPath('data.status', 'new')
        ->assertJsonPath('message', 'Submission received.');

    // Exactly {id,status} in data — nothing else leaks back to the anonymous submitter.
    expect(array_keys($res->json('data')))->toBe(['id', 'status']);
});

it('persists a seller_submissions row with status=new', function () {
    Mail::fake();

    $res = $this->postJson('/api/submissions', validSubmissionPayload([
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

    $this->postJson('/api/submissions', validSubmissionPayload())->assertCreated();

    Mail::assertSent(SubmissionReceived::class, fn (SubmissionReceived $mail): bool =>
        $mail->hasTo(config('mail.from.address')));
});

it('rejects missing required fields with 422', function () {
    Mail::fake();

    $this->postJson('/api/submissions', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors([
            'name', 'email', 'project_name', 'description', 'asking_price_cents', 'mrr_cents',
        ]);

    Mail::assertNothingSent();
});

it('rejects an invalid email with 422', function () {
    $this->postJson('/api/submissions', validSubmissionPayload(['email' => 'not-an-email']))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('requires asking_price_cents and mrr_cents to be integers >= 0', function () {
    // non-integer
    $this->postJson('/api/submissions', validSubmissionPayload(['asking_price_cents' => 'lots']))
        ->assertStatus(422)->assertJsonValidationErrors(['asking_price_cents']);
    // negative
    $this->postJson('/api/submissions', validSubmissionPayload(['mrr_cents' => -1]))
        ->assertStatus(422)->assertJsonValidationErrors(['mrr_cents']);
    // zero is allowed (min:0)
    Mail::fake();
    $this->postJson('/api/submissions', validSubmissionPayload(['email' => 'zero@example.com', 'mrr_cents' => 0]))
        ->assertCreated();
});

it('rejects non-HTTPS url values', function () {
    foreach (['http://insecure.example.com', 'ftp://files.example.com', 'ssh://git@example.com', 'not a url'] as $bad) {
        $this->postJson('/api/submissions', validSubmissionPayload(['url' => $bad]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['url']);
    }
});

it('accepts an https url, a null url, and an omitted url', function () {
    Mail::fake();

    // https
    $this->postJson('/api/submissions', validSubmissionPayload(['email' => 'https@example.com', 'url' => 'https://ok.example.com']))
        ->assertCreated();

    // explicit null
    $this->postJson('/api/submissions', validSubmissionPayload(['email' => 'null@example.com', 'url' => null]))
        ->assertCreated();

    // omitted entirely
    $payload = validSubmissionPayload(['email' => 'omit@example.com']);
    unset($payload['url']);
    $this->postJson('/api/submissions', $payload)->assertCreated();
});
