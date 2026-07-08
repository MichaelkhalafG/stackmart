<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'product_id' => Product::factory(),
            'amount_cents' => fake()->numberBetween(90000, 2500000),
            'currency' => 'USD',
            'status' => Order::STATUS_PENDING,
            // "fake" is the provider KEY (FakePaymentProvider), never a real gateway name.
            'payment_provider' => 'fake',
            'provider_reference' => 'ref_'.fake()->unique()->uuid(),
            'provider_payment_id' => null,
            'payment_meta' => null,
            'license_key' => null,
            'delivered_at' => null,
            'download_count' => 0,
        ];
    }

    /**
     * A fulfilled order: paid, licensed, and delivered (what FulfillOrder produces).
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Order::STATUS_PAID,
            'provider_payment_id' => 'pay_'.fake()->uuid(),
            'payment_meta' => ['event' => 'payment.succeeded'],
            'license_key' => fake()->regexify('[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}'),
            'delivered_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }
}
