<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

/*
 * Profile self-service (Day 6) — PATCH /api/auth/profile + PATCH /api/auth/password.
 *
 * Sanctum-protected, CURRENT USER ONLY: neither endpoint accepts a user id, so there is no way to
 * address another account. Changing a password requires the CURRENT password, so a stolen-but-valid
 * session alone cannot rotate it and lock the owner out.
 */

/* ── PATCH /auth/profile ───────────────────────────────────────────────────────────────────── */

it('updates the signed-in user\'s name and returns the frozen user block', function () {
    $user = User::factory()->create(['name' => 'Old Name']);

    Sanctum::actingAs($user);

    $this->patchJson('/api/auth/profile', ['name' => 'New Name'])
        ->assertOk()
        ->assertJsonPath('data.name', 'New Name')
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email)
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'is_admin'], 'message']);

    expect($user->fresh()->name)->toBe('New Name');
});

it('rejects an empty or too-short name (422)', function () {
    $user = User::factory()->create(['name' => 'Original']);

    Sanctum::actingAs($user);

    $this->patchJson('/api/auth/profile', ['name' => ''])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name']);

    $this->patchJson('/api/auth/profile', ['name' => 'A'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name']);

    expect($user->fresh()->name)->toBe('Original'); // unchanged
});

it('never lets one user rename another (no id is accepted)', function () {
    $me = User::factory()->create(['name' => 'Me']);
    $someoneElse = User::factory()->create(['name' => 'Someone Else']);

    Sanctum::actingAs($me);

    // Even if an id is smuggled into the body, only the AUTHENTICATED user is touched.
    $this->patchJson('/api/auth/profile', ['name' => 'Hijacked', 'id' => $someoneElse->id])
        ->assertOk();

    expect($me->fresh()->name)->toBe('Hijacked');
    expect($someoneElse->fresh()->name)->toBe('Someone Else'); // untouched
});

it('requires authentication to update the profile (401)', function () {
    $this->patchJson('/api/auth/profile', ['name' => 'Nope'])->assertUnauthorized();
});

/* ── PATCH /auth/password ──────────────────────────────────────────────────────────────────── */

it('changes the password when the current password is correct', function () {
    $user = User::factory()->create(['password' => 'old-password']);

    Sanctum::actingAs($user);

    $this->patchJson('/api/auth/password', [
        'current_password' => 'old-password',
        'password' => 'brand-new-password',
        'password_confirmation' => 'brand-new-password',
    ])->assertOk()->assertJsonStructure(['message']);

    // Re-hashed: the new password verifies, the old one no longer does.
    $fresh = $user->fresh();
    expect(Hash::check('brand-new-password', $fresh->password))->toBeTrue();
    expect(Hash::check('old-password', $fresh->password))->toBeFalse();
});

it('rejects a WRONG current password (422) and leaves the password unchanged', function () {
    $user = User::factory()->create(['password' => 'old-password']);

    Sanctum::actingAs($user);

    $this->patchJson('/api/auth/password', [
        'current_password' => 'not-my-password',
        'password' => 'brand-new-password',
        'password_confirmation' => 'brand-new-password',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['current_password']);

    // The old password still works — nothing was rotated.
    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});

it('requires the current password to be supplied (422)', function () {
    $user = User::factory()->create(['password' => 'old-password']);

    Sanctum::actingAs($user);

    $this->patchJson('/api/auth/password', [
        'password' => 'brand-new-password',
        'password_confirmation' => 'brand-new-password',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['current_password']);

    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});

it('requires the new password to be confirmed and at least 8 characters (422)', function () {
    $user = User::factory()->create(['password' => 'old-password']);

    Sanctum::actingAs($user);

    // Mismatched confirmation.
    $this->patchJson('/api/auth/password', [
        'current_password' => 'old-password',
        'password' => 'brand-new-password',
        'password_confirmation' => 'different-password',
    ])->assertStatus(422)->assertJsonValidationErrors(['password']);

    // Too short.
    $this->patchJson('/api/auth/password', [
        'current_password' => 'old-password',
        'password' => 'short',
        'password_confirmation' => 'short',
    ])->assertStatus(422)->assertJsonValidationErrors(['password']);

    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});

it('revokes OTHER sessions on a successful password change but keeps the current one', function () {
    $user = User::factory()->create(['password' => 'old-password']);

    // A second device/session that must be cut off by the change.
    $otherToken = $user->createToken('other-device');
    expect($user->tokens()->count())->toBe(1);

    // Sanctum::actingAs adds the acting token, so the user now has two.
    Sanctum::actingAs($user);

    $this->patchJson('/api/auth/password', [
        'current_password' => 'old-password',
        'password' => 'brand-new-password',
        'password_confirmation' => 'brand-new-password',
    ])->assertOk();

    // The other device's token is gone.
    expect($user->tokens()->whereKey($otherToken->accessToken->getKey())->exists())->toBeFalse();
});

it('requires authentication to change the password (401)', function () {
    $this->patchJson('/api/auth/password', [
        'current_password' => 'x',
        'password' => 'brand-new-password',
        'password_confirmation' => 'brand-new-password',
    ])->assertUnauthorized();
});

it('never returns the password hash', function () {
    $user = User::factory()->create(['name' => 'Visible']);

    Sanctum::actingAs($user);

    $res = $this->patchJson('/api/auth/profile', ['name' => 'Still Visible']);

    expect($res->getContent())->not->toContain('password');
    expect($res->getContent())->not->toContain($user->fresh()->password);
});
