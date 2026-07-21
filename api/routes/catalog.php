<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\SubmissionController;
use App\Http\Middleware\EnsureSellingEnabled;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Catalog routes  — public, no auth. Base prefix: /api
|--------------------------------------------------------------------------
| Frozen contract (Planning/12_API_Specification.md), authored in Day 2 (J2.x):
|   GET  /products            list (search, category, stack, min_price, max_price, sort, page → {data,meta})
|   GET  /products/{slug}     detail (ProductResource exposes demo_url + repository_url)
|   GET  /categories          list
|   POST /submissions         seller submission (fires SubmissionReceived)
*/

// J2.01 — public catalog index.
Route::get('/products', [CatalogController::class, 'index']);

// J2.02 — public listing detail (bound by slug; unknown slug → 404).
Route::get('/products/{product:slug}', [CatalogController::class, 'show']);

// J2.03 — public category taxonomy (ordered by sort_order).
Route::get('/categories', [CatalogController::class, 'categories']);

// J3.01 (expanded by DR-8) — public seller submission (persists status=new, fires
// SubmissionReceived). This is a MULTIPART endpoint: an unauthenticated caller can push a
// 100 MB ZIP + a README + 8 images per request, so it is rate-limited to blunt storage-exhaustion
// abuse. It remains public by design — there are no seller accounts.
//
// EnsureSellingEnabled 404s the whole thing when the deployment is buyer-only (ENABLE_SELLING),
// and runs before validation so a closed endpoint never processes an upload at all.
Route::post('/submissions', [SubmissionController::class, 'store'])
    ->middleware([EnsureSellingEnabled::class, 'throttle:10,1']);
