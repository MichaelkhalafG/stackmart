<?php

namespace App\Http\Controllers;

use App\Http\Requests\DownloadRequest;
use App\Models\Order;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * License-gated deliverable download (routes/commerce.php) — POST /api/orders/{order}/download.
 *
 * Streams a purchased product's ZIP from the PRIVATE `deliverables` disk (never a public URL).
 *
 * FOUR checks, in order — the license key is an EXTRA layer, NOT a replacement for the originals:
 *   1. Sanctum Bearer auth   (route middleware)
 *   2. OWNER of the order    → else 404 (indistinguishable from an order that doesn't exist)
 *   3. order status = paid   → else 403
 *   4. submitted LICENSE KEY matches the order's → else 422 (no file, no count increment)
 *
 * Security notes:
 *   • compared with `hash_equals` (constant time), so a wrong key can't be found by timing;
 *   • the real key is NEVER echoed back — the error only says it doesn't match;
 *   • the route is rate-limited (routes/commerce.php), so the key space can't be brute-forced;
 *   • it is a POST, so the key travels in the body, not in a URL that lands in access logs and
 *     browser history;
 *   • `download_count` still increments ONLY on a fully successful, authorized stream.
 */
class DownloadController extends Controller
{
    public function store(DownloadRequest $request, Order $order): StreamedResponse
    {
        // (2) — never reveal the deliverable to anyone else. 404, not 403: a non-owner must not be
        // able to tell an existing order from a nonexistent one by probing ids.
        abort_unless($order->user_id === $request->user()->id, 404);

        // (3) — the order is yours but not paid. 403 is correct here and leaks nothing: you already
        // know your own order exists.
        abort_unless($order->status === Order::STATUS_PAID, 403);

        // (4) — the license gate.
        $this->assertLicenseMatches($order, (string) $request->validated()['license_key']);

        $path = $order->product->deliverable_path;
        $disk = Storage::disk('deliverables');

        // Paid but no deliverable uploaded / missing on disk → 404 (nothing to stream).
        abort_if($path === null || $path === '' || ! $disk->exists($path), 404);

        // Count each successful, authorized stream (only ever reached on full success).
        $order->increment('download_count');

        return $disk->download($path, $order->product->slug.'.zip', [
            'Content-Type' => 'application/zip',
        ]);
    }

    /**
     * Constant-time license comparison. Keys are issued uppercase (XXXX-XXXX-XXXX-XXXX), so we
     * normalize case/whitespace on BOTH sides first — a buyer pasting their key in lowercase is not
     * an attack, and normalizing does not weaken the comparison.
     *
     * @throws ValidationException 422 — friendly, and never leaks the real key.
     */
    private function assertLicenseMatches(Order $order, string $submitted): void
    {
        $actual = $this->normalize((string) $order->license_key);
        $given = $this->normalize($submitted);

        if ($actual === '' || ! hash_equals($actual, $given)) {
            throw ValidationException::withMessages([
                'license_key' => ["That license key doesn't match this order — check your confirmation email."],
            ]);
        }
    }

    private function normalize(string $key): string
    {
        return strtoupper(preg_replace('/\s+/', '', $key) ?? '');
    }
}
