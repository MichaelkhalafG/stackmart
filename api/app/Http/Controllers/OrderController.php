<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Authenticated buyer's orders READ API (routes/commerce.php, Bearer auth).
 *
 * Thin by design (Planning/09_Backend_Architecture.md): query via Eloquent,
 * serialize via OrderResource. No service/repository layer. Ownership is
 * enforced here — a buyer only ever sees their own orders.
 */
class OrderController extends Controller
{
    /**
     * GET /api/orders — the authenticated buyer's own orders, newest first.
     *
     * Eager-loads `product` (the Resource reads title/slug) to avoid N+1.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()
            ->orders()
            ->with('product')
            ->orderByDesc('created_at')
            ->orderByDesc('id') // stable tiebreaker when orders share a created_at second
            ->get();

        return OrderResource::collection($orders);
    }

    /**
     * GET /api/orders/{order} — a single order, resolved by numeric id OR by
     * `provider_reference` (the /checkout/success?ref= path). Owner-only: a
     * non-owner gets 403, an unknown id/ref gets 404.
     */
    public function show(Request $request, string $order): OrderResource
    {
        // Numeric → id lookup; otherwise treat the segment as a provider_reference.
        $query = ctype_digit($order)
            ? Order::whereKey($order)
            : Order::where('provider_reference', $order);

        $model = $query->with('product')->firstOrFail();

        abort_unless($model->user_id === $request->user()->id, 403);

        return new OrderResource($model);
    }
}
