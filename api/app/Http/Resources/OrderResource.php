<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Buyer-facing order serializer for GET /api/orders and GET /api/orders/{id}.
 *
 * Owns the frozen §Buyer shape (Planning/12_API_Specification.md). A single
 * `new OrderResource($order)` is wrapped by Laravel as `{ "data": { ... } }`;
 * `OrderResource::collection(...)` as `{ "data": [ ... ] }`.
 *
 * `license_key` and `delivered_at` are null until FulfillOrder marks
 * the order paid — rendered as-is (null is a valid pre-fulfillment state).
 *
 * `can_download` is a DERIVED signal (owner + status=paid), never a stored column —
 * the frontend uses it to enable the download button without re-deriving the rule.
 *
 * @property Order $resource
 */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product' => [
                'title' => $this->product->title,
                'slug' => $this->product->slug,
            ],
            'amount_cents' => $this->amount_cents,
            'currency' => $this->currency,
            'status' => $this->status,
            'provider_reference' => $this->provider_reference,
            // Populate only after fulfillment — null pre-fulfillment.
            'license_key' => $this->license_key,
            'download_count' => $this->download_count,
            'delivered_at' => $this->delivered_at?->toISOString(),
            // Derived, not stored: the owner of a paid order may download.
            'can_download' => $request->user()?->id === $this->user_id
                && $this->status === Order::STATUS_PAID,
        ];
    }
}
