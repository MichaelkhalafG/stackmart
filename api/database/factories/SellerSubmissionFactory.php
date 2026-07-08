<?php

namespace Database\Factories;

use App\Models\SellerSubmission;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SellerSubmission>
 */
class SellerSubmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'project_name' => Str::title(fake()->words(2, true)),
            'url' => 'https://'.fake()->domainName(),
            'asking_price_cents' => fake()->numberBetween(90000, 2500000), // $900 – $25,000
            'mrr_cents' => fake()->numberBetween(0, 500000),
            'description' => fake()->paragraph(),
            'status' => SellerSubmission::STATUS_NEW,
            'admin_notes' => null,
        ];
    }
}
