<?php

/*
|--------------------------------------------------------------------------
| API Routes (base prefix: /api)
|--------------------------------------------------------------------------
| The API surface is split into three files, each included EXACTLY ONCE
| below and frozen on Day 1 (see Planning/12_API_Specification.md):
|   - catalog.php  products, categories, submissions   (public)
|   - auth.php  register/login/logout/me/password
|   - commerce.php  checkout, orders, download, webhook
|
| The three files are intentionally empty on Day 1 — each owner fills their
| own routes later. Do NOT add route logic here.
*/

require __DIR__.'/catalog.php';
require __DIR__.'/auth.php';
require __DIR__.'/commerce.php';
