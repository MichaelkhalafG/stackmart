<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Only the Next.js frontend origin (FRONTEND_URL, env-driven — never a
    | hardcoded host) may call the API. Auth is Sanctum Bearer tokens, so no
    | cookies/credentials are shared (supports_credentials = false).
    */

    // Only the JSON API is CORS-enabled. (Auth is Sanctum Bearer, not cookie mode, so the
    // sanctum/csrf-cookie path is intentionally NOT included — no CSRF cookie is used.)
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Env-driven allowlist (no hardcoded host). `rtrim('/')` normalizes a trailing slash so a
    // FRONTEND_URL like "http://localhost:3000/" still matches the browser Origin header
    // (which never has a trailing slash); `array_filter` drops an unset FRONTEND_URL rather
    // than allowing the literal "null"/empty origin.
    'allowed_origins' => array_values(array_filter([
        rtrim((string) env('FRONTEND_URL'), '/'),
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
