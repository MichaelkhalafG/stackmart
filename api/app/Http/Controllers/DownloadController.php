<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Authenticated deliverable download (routes/commerce.php) — GET /api/orders/{id}/download.
 *
 * Streams a purchased product's ZIP from the PRIVATE `deliverables` disk (no public URL). The
 * order is bound by numeric id (the id-or-provider_reference lookup is orders-read
 * API). Access requires OWNER + `status=paid` — anything else is 403 (frozen contract §Buyer).
 * Each successful, authorized stream increments `orders.download_count`.
 */
class DownloadController extends Controller
{
    public function show(Request $request, Order $order): StreamedResponse
    {
        // Owner + paid, else 403 (never reveal the deliverable to anyone else).
        abort_unless($order->user_id === $request->user()->id, 403);
        abort_unless($order->status === Order::STATUS_PAID, 403);

        $path = $order->product->deliverable_path;
        $disk = Storage::disk('deliverables');

        // Paid but no deliverable uploaded / missing on disk → 404 (nothing to stream).
        abort_if($path === null || $path === '' || ! $disk->exists($path), 404);

        // Count each successful, authorized stream.
        $order->increment('download_count');

        return $disk->download($path, $order->product->slug.'.zip', [
            'Content-Type' => 'application/zip',
        ]);
    }
}
