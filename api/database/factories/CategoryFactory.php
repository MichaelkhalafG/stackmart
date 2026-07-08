<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Unique word phrase → deterministic, collision-free slug (no punctuation in faker words()).
        $words = fake()->unique()->words(2, true);

        return [
            'name' => Str::title($words),
            'slug' => Str::slug($words),
            'sort_order' => fake()->numberBetween(0, 20),
        ];
    }
}
