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

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Env-driven allowlist; array_filter drops a null FRONTEND_URL rather than
    // allowing the literal "null" origin.
    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL'),
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
