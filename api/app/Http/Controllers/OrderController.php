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
     * `provider_reference` (the /checkout/success?ref= path).
     *
     * Owner-only, and a non-owner gets the SAME 404 as a nonexistent order. Answering 403 would
     * have confirmed "this order exists, it just isn't yours", turning the endpoint into an
     * oracle for probing order ids and references. Someone else's order should be indistinguishable
     * from no order at all.
     */
    public function show(Request $request, string $order): OrderResource
    {
        // Numeric → id lookup; otherwise treat the segment as a provider_reference. Scoping the
        // query to the caller means a non-owner can never load the row in the first place.
        $query = ctype_digit($order)
            ? Order::whereKey($order)
            : Order::where('provider_reference', $order);

        $model = $query->where('user_id', $request->user()->id)
            ->with('product')
            ->firstOrFail();

        return new OrderResource($model);
    }
}
