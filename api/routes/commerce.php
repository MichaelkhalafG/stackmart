<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Commerce routes  — buyer (Bearer) + provider webhook. Base prefix: /api
|--------------------------------------------------------------------------
| Frozen contract (Planning/12_API_Specification.md), authored in Day 4 (S4.x):
|   POST /checkout                 Bearer  { product_id } → { url }  (via PaymentProvider::createCheckout)  [S4.01]
|   GET  /orders                   Bearer  buyer's own orders
|   GET  /orders/{id}              Bearer  by id OR provider_reference; owner only
|   GET  /orders/{id}/download     Bearer  owner + paid; streams ZIP; increments download_count             [S4.04]
|   POST /webhooks/payment         none    provider-verified → PaymentEvent → FulfillOrder (idempotent)     [S4.02]
|
| Provider stays behind the PaymentProvider contract (app/Payments, S1.07) — never
| name a gateway here. SHARED FILE on Day 4: adds checkout/webhook/download; the
| adds the two orders-read routes into the same Bearer group below.
*/

// S4.01 — buyer checkout. Bearer (auth:sanctum). Creates a PENDING order via the bound
// PaymentProvider and returns { url }; the frontend only redirects, never names a gateway.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // (J4.01, this cycle) registers GET /orders + GET /orders/{id} here (shared group).

    // S4.04 — authenticated deliverable download (owner + paid; streams the private ZIP;
    // increments download_count). Order bound by numeric id.
    Route::get('/orders/{order}/download', [DownloadController::class, 'show']);
});

// S4.02 — provider webhook. NO user auth (verified inside PaymentProvider::handleWebhook).
// On a verified `paid` event → FulfillOrder; idempotent (row-locked status guard); always 200.
Route::post('/webhooks/payment', [WebhookController::class, 'handle']);
