<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Deployment switches
    |--------------------------------------------------------------------------
    | Per-deployment behaviour that is NOT a code change. Read through config()
    | (never env() at the point of use), so everything here survives config:cache.
    */

    /*
    | Selling — the server-side half of the frontend's SHOW_SELL flag.
    |
    | false closes POST /api/submissions with a 404. That endpoint is public and accepts a 100 MB
    | ZIP + README + 8 images per request, so leaving it open while the sell UI is hidden means an
    | attacker who reads the repo can still fill the disk and flood the admin inbox. Hiding the
    | button is not closing the door.
    |
    | Keep this in sync with SHOW_SELL in web/src/lib/config.ts. Nothing is deleted either side:
    | flip both to true and the whole submission flow is back.
    */
    'selling' => (bool) env('ENABLE_SELLING', true),

    /*
    | Filament admin mount path. '' = the API's web root, which is the default and what local dev
    | expects. In production, set FILAMENT_ADMIN_PATH to something non-obvious so the admin login
    | is not the first thing served at the API domain's root.
    |
    | Changing this moves the whole panel (login, dashboard, every resource URL). Nothing else in
    | the app links to it, so a change is self-contained — but bookmarks break, and the API's `/`
    | starts returning 404 instead of the login page.
    */
    'admin_path' => (string) env('FILAMENT_ADMIN_PATH', ''),

];
