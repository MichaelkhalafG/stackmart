<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

/*
 * Resetting a password must actually lock an attacker out.
 *
 * The reset flow rotated `remember_token`, which means nothing to Bearer auth — so a token lifted
 * from a victim's browser survived the reset, and the single action a compromised user takes to
 * recover their account did not recover it. Every token is now revoked on reset.
 */

it('revokes every access token when the password is reset', function () {
    $user = User::factory()->create(['password' => Hash::make('old-password-123')]);

    // Two live sessions — say, the victim's laptop and an attacker's stolen token.
    $victim = $user->createToken('laptop')->plainTextToken;
    $stolen = $user->createToken('stolen')->plainTextToken;
    expect($user->tokens()->count())->toBe(2);

    $this->postJson('/api/auth/reset-password', [
        'token' => Password::createToken($user),
        'email' => $user->email,
        'password' => 'a-brand-new-password',
    ])->assertOk();

    // Both tokens are gone from the database…
    expect($user->fresh()->tokens()->count())->toBe(0);

    // …and neither can still authenticate.
    $this->withHeader('Authorization', "Bearer {$stolen}")
        ->getJson('/api/auth/me')
        ->assertUnauthorized();

    $this->withHeader('Authorization', "Bearer {$victim}")
        ->getJson('/api/auth/me')
        ->assertUnauthorized();

    // The new password works, so the reset itself still did its job.
    $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'a-brand-new-password',
    ])->assertOk();
});

it('leaves tokens alone when the reset token is invalid', function () {
    $user = User::factory()->create(['password' => Hash::make('old-password-123')]);
    $user->createToken('laptop');

    $this->postJson('/api/auth/reset-password', [
        'token' => 'not-a-real-reset-token',
        'email' => $user->email,
        'password' => 'a-brand-new-password',
    ])->assertStatus(422);

    // A failed reset must not be usable to sign someone else out.
    expect($user->fresh()->tokens()->count())->toBe(1);
});
