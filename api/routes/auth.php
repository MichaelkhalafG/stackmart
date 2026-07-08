<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth routes  — Sanctum Bearer tokens. Base prefix: /api
|--------------------------------------------------------------------------
| Frozen contract (Planning/12_API_Specification.md), authored in Day 3 (S3.x):
|   POST /auth/register            none    → { token, user }
|   POST /auth/login               none    → { token, user }
|   POST /auth/logout              Bearer  (revokes current token)
|   GET  /auth/me                  Bearer  → { user }
|   POST /auth/forgot-password     none    (PasswordReset mailable; rate-limited)
|   POST /auth/reset-password      none    (rate-limited)
|
| Intentionally EMPTY on Day 1 — the fills these in.
*/
