<?php

use App\Models\User;

/*
 * Auth flow — register / login / logout / me (Sanctum Bearer tokens).
 * Written to the FROZEN §Auth contract (Planning/12_API_Specification.md). The
 * endpoints (S3.01) live on `day-3`; routes/auth.php is empty on this
 * branch, so every test SKIPS here and runs automatically once S3.01 is merged
 * at end-of-day integration (roadmap dependency J3.03 dep S3.01). The endpoints
 * are NEVER stubbed — these hit the real HTTP layer.
 */

$authAvailable = fn (): bool => ! authEndpointsAvailable();
$reason = 'S3.01 auth endpoints land on day-3 — green after end-of-day integration.';

it('registers a user and issues a token', function () {
    $res = $this->postJson('/api/auth/register', [
        'name' => 'Jane Buyer',
        'email' => 'jane.register@example.com',
        'password' => 'password123',
    ])->assertSuccessful();

    $res->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email', 'is_admin']]]);

    expect($res->json('data.token'))->toBeString()->not->toBeEmpty()
        ->and($res->json('data.user.email'))->toBe('jane.register@example.com')
        ->and($res->json('data.user.is_admin'))->toBeFalse();

    $this->assertDatabaseHas('users', ['email' => 'jane.register@example.com']);
})->skip($authAvailable, $reason);

it('rejects registering a duplicate email with 422', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/auth/register', [
        'name' => 'Someone', 'email' => 'taken@example.com', 'password' => 'password123',
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
})->skip($authAvailable, $reason);

it('logs in with valid credentials and issues a token', function () {
    User::factory()->create(['email' => 'login@example.com']); // factory password = "password"

    $res = $this->postJson('/api/auth/login', [
        'email' => 'login@example.com', 'password' => 'password',
    ])->assertSuccessful();

    $res->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email', 'is_admin']]]);
    expect($res->json('data.token'))->toBeString()->not->toBeEmpty();
})->skip($authAvailable, $reason);

it('rejects login with an invalid password', function () {
    User::factory()->create(['email' => 'login2@example.com']);

    $res = $this->postJson('/api/auth/login', [
        'email' => 'login2@example.com', 'password' => 'wrong-password',
    ]);

    // Contract does not pin the code; it must reject (not 2xx) and issue no token.
    expect($res->status())->toBeIn([401, 422]);
    expect($res->json('data.token'))->toBeNull();
})->skip($authAvailable, $reason);

it('returns the current user for GET /auth/me with a valid Bearer token', function () {
    $token = $this->postJson('/api/auth/register', [
        'name' => 'Me User', 'email' => 'me@example.com', 'password' => 'password123',
    ])->assertSuccessful()->json('data.token');

    $res = $this->withToken($token)->getJson('/api/auth/me')->assertOk();

    $res->assertJsonStructure(['data' => ['id', 'name', 'email', 'is_admin']])
        ->assertJsonPath('data.email', 'me@example.com');
})->skip($authAvailable, $reason);

it('rejects GET /auth/me without a token (401)', function () {
    $this->getJson('/api/auth/me')->assertUnauthorized(); // 401 Unauthenticated (frozen contract)
})->skip($authAvailable, $reason);

it('revokes the current token on logout', function () {
    $token = $this->postJson('/api/auth/register', [
        'name' => 'Logout User', 'email' => 'logout@example.com', 'password' => 'password123',
    ])->assertSuccessful()->json('data.token');

    // The token works before logout...
    $this->withToken($token)->getJson('/api/auth/me')->assertOk();

    $this->withToken($token)->postJson('/api/auth/logout')->assertSuccessful();

    // The Sanctum guard caches the resolved user on the AuthManager for the lifetime of the
    // app instance, which — unlike separate real HTTP requests — spans every request within a
    // single test. Forget the guards so the next request re-resolves the Bearer token from the
    // database (where logout just deleted it) instead of returning the cached user. The token
    // is genuinely revoked server-side; this only defeats the in-test guard cache.
    $this->app['auth']->forgetGuards();

    // ...and is revoked after (401 on a guarded route).
    $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
})->skip($authAvailable, $reason);
