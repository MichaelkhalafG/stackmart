<?php

namespace App\Providers;

use App\Payments\PaymentProvider;
use Illuminate\Support\ServiceProvider;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind the ONLY permitted abstraction: resolve PaymentProvider from the
        // PAYMENT_PROVIDER env (config/payments.php) — provider-agnostic, no gateway named.
        $this->app->bind(PaymentProvider::class, function ($app) {
            $provider = config('payments.provider');
            $class = config("payments.providers.{$provider}");

            if (! is_string($class) || ! class_exists($class)) {
                throw new RuntimeException(
                    "Unknown payment provider [{$provider}] — check config/payments.php and PAYMENT_PROVIDER."
                );
            }

            return $app->make($class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
