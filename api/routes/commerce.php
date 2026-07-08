<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Commerce routes  — buyer (Bearer) + provider webhook. Base prefix: /api
|--------------------------------------------------------------------------
| Frozen contract (Planning/12_API_Specification.md), authored in Day 4 (S4.x):
|   POST /checkout                 Bearer  { product_id } → { url }  (via PaymentProvider::createCheckout)
|   GET  /orders                   Bearer  buyer's own orders
|   GET  /orders/{id}              Bearer  by id OR provider_reference; owner only
|   GET  /orders/{id}/download     Bearer  owner + paid; streams ZIP; increments download_count
|   POST /webhooks/payment         none    provider-verified → PaymentEvent → FulfillOrder (idempotent)
|
| Provider stays behind the PaymentProvider contract (app/Payments, S1.07) — never
| name a gateway here. Intentionally EMPTY on Day 1 — the fills these in.
*/
