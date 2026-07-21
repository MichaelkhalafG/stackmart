<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Closes the seller-submission surface when the deployment runs buyer-only
 * (config/features.php `selling`, env ENABLE_SELLING).
 *
 * Returns 404 rather than 403: a disabled feature should look absent, not forbidden. This mirrors
 * the frontend, where SHOW_SELL=false makes /sell render the 404 page.
 *
 * Deliberately a middleware and not a controller check — it runs BEFORE the Form Request, so a
 * disabled endpoint never validates (or buffers through) a 100 MB upload. Route registration stays
 * unconditional so the switch is read per-request and `route:cache` can't freeze it on.
 */
class EnsureSellingEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(config('features.selling'), 404);

        return $next($request);
    }
}
