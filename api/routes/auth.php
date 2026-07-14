<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth routes  — Sanctum Bearer tokens. Base prefix: /api
|--------------------------------------------------------------------------
| Frozen contract (Planning/12_API_Specification.md), authored in Day 3 (S3.x):
|   POST /auth/register            none    → { token, user }        [S3.01]
|   POST /auth/login               none    → { token, user }        [S3.01]
|   POST /auth/logout              Bearer  (revokes current token)  [S3.01]
|   GET  /auth/me                  Bearer  → { user }               [S3.01]
|   POST /auth/forgot-password     none    (PasswordReset mailable; rate-limited)  [S3.02]
|   POST /auth/reset-password      none    (rate-limited)                          [S3.02]
|
| Added Day 6 (profile self-service — see the API spec §Auth):
|   PATCH /auth/profile            Bearer  { name }                                     → { data: user, message }
|   PATCH /auth/password           Bearer  { current_password, password, password_confirmation } → { message }
*/

// S3.01 — public entry points. Throttled (auth-appropriate: 10 requests / minute / IP)
// so credential-stuffing and mass account creation are rate-limited.
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// S3.01 — Bearer-authenticated. logout revokes only the current access token.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Profile self-service — CURRENT USER ONLY (no id is ever accepted from the request).
    //   PATCH /auth/profile   → update the display name        → { data: user, message }
    //   PATCH /auth/password  → change the password (requires current_password); revokes other tokens
    // The password route is throttled: `current_password` is a secret being guessed against.
    Route::patch('/auth/profile', [ProfileController::class, 'update']);
    Route::patch('/auth/password', [ProfileController::class, 'updatePassword'])
        ->middleware('throttle:10,1');
});

// S3.02 — password reset via Laravel's Password broker (framework ResetPassword mail;
// log driver in dev). forgot-password always returns a generic message (no enumeration).
// Throttled (10 requests / minute / IP) against reset-token brute force + mail flooding.
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:10,1');
Route::post('/auth/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:10,1');
