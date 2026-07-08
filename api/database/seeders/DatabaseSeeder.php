<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the frozen catalog contract.
     *
     * Order matters: categories must exist before ProductSeeder resolves category_id by slug.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            UserSeeder::class,
            SellerSubmissionSeeder::class,
        ]);
    }
}
