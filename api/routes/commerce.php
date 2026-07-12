<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Commerce routes  — buyer (Bearer) + provider webhook. Prefix: /api
|--------------------------------------------------------------------------
| Frozen contract (Planning/12_API_Specification.md), authored in Day 4:
|   POST /checkout                 Bearer  { product_id } → { url }  (via PaymentProvider::createCheckout)  [S4.01]
|   GET  /orders                   Bearer  buyer's own orders
|   GET  /orders/{id}              Bearer  by id OR provider_reference; owner only
|   GET  /orders/{id}/download     Bearer  owner + paid; streams ZIP; increments download_count             [S4.04]
|   POST /webhooks/payment         none    provider-verified → PaymentEvent → FulfillOrder (idempotent)     [S4.02]
|
| Provider stays behind the PaymentProvider contract (app/Payments, S1.07) — never name a
| gateway here. This file was authored by BOTH developers on Day 4 and merged keep-both at end-of-day integration.
*/

// Bearer-authenticated buyer routes (Sanctum). ONE group for checkout, the orders read API,
// and the deliverable download.
Route::middleware('auth:sanctum')->group(function () {
    // S4.01 — buyer checkout. Creates a PENDING order via the bound PaymentProvider and returns
    // { url }; the frontend only redirects, never names a gateway.
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // J4.01 — buyer's orders READ API. The literal /orders (index) is declared BEFORE the
    // /orders/{order} wildcard (show) so it is never shadowed.
    Route::get('/orders', [OrderController::class, 'index']);
    // Single order by numeric id OR provider_reference; owner-only (else 403).
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // S4.04 — authenticated deliverable download (owner + paid; streams the private ZIP;
    // increments download_count). Distinct 3-segment path — does not collide with /orders/{order}.
    Route::get('/orders/{order}/download', [DownloadController::class, 'show']);
});

// S4.02 — provider webhook. NO user auth (provider-verified inside PaymentProvider::handleWebhook);
// registered OUTSIDE the auth:sanctum group. On a verified `paid` event → FulfillOrder; idempotent
// (row-locked status guard); always 200.
Route::post('/webhooks/payment', [WebhookController::class, 'handle']);
