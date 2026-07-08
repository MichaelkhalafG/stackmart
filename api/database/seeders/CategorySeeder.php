<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * The 6 fixed categories. Slugs are stable identifiers the ProductSeeder and the
     * frontend catalog filters resolve against (part of the frozen contract).
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'AI Tools', 'slug' => 'ai-tools', 'sort_order' => 1],
            ['name' => 'E-commerce', 'slug' => 'e-commerce', 'sort_order' => 2],
            ['name' => 'Productivity', 'slug' => 'productivity', 'sort_order' => 3],
            ['name' => 'Dev Tools', 'slug' => 'dev-tools', 'sort_order' => 4],
            ['name' => 'Marketplace', 'slug' => 'marketplace', 'sort_order' => 5],
            ['name' => 'Mobile', 'slug' => 'mobile', 'sort_order' => 6],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
