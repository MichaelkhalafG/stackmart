<?php

use App\Http\Controllers\CatalogController;
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
