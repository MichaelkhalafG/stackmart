<?php

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Laravel 11 does NOT rate-limit the api group unless you ask, so every route without an
        // explicit throttle was unlimited — catalogue scraping, unbounded order creation, hammering
        // the webhook. A literal limit (rather than the named `api` limiter) keeps this self-contained:
        // no RateLimiter::for() registration to remember, and it works under route:cache.
        //
        // 120/min per token (falling back to IP) is a browsing ceiling, not a usage limit: a real
        // visitor loading the marketplace, a listing, and their orders is nowhere near it. The
        // stricter per-route throttles (auth 10/min, download 10/min, submissions 10/min, webhook
        // 30/min) still apply on top — this is the floor under everything, not a replacement.
        $middleware->throttleApi('120,1');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // SENSITIVE (DR-8): never flash the seller's financial details back into the session on a
        // validation failure, and keep them out of exception context / debug pages.
        $exceptions->dontFlash([
            'current_password',
            'password',
            'password_confirmation',
            'payout_identifier',
            'payout_holder_name',
            'payout_bank_name',
        ]);

        // Frozen 404 contract (Planning/12_API_Specification.md): API/JSON not-found
        // responses are exactly {"message":"Not found."} — never leak the model class or a debug trace.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (($e instanceof NotFoundHttpException || $e instanceof ModelNotFoundException)
                && ($request->expectsJson() || $request->is('api/*'))) {
                return response()->json(['message' => 'Not found.'], 404);
            }
        });
    })->create();
