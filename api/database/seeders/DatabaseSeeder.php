<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the frozen catalog contract.
     *
     * Order matters: categories before ProductSeeder (resolves category_id by slug);
     * users + products before OrderSeeder (orders reference both).
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            UserSeeder::class,
            OrderSeeder::class,
            SellerSubmissionSeeder::class,
        ]);
    }
}
