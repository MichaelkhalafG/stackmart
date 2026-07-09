<?php

use App\Models\Category;

/*
 * GET /api/categories — CategoryResource (J2.03).
 * Flat {data:[...]} ordered by sort_order, exactly four fields per row.
 */

it('returns categories ordered by sort_order with exactly the four contract fields', function () {
    Category::factory()->create(['name' => 'Beta', 'slug' => 'beta', 'sort_order' => 2]);
    Category::factory()->create(['name' => 'Alpha', 'slug' => 'alpha', 'sort_order' => 1]);
    Category::factory()->create(['name' => 'Gamma', 'slug' => 'gamma', 'sort_order' => 3]);

    $res = $this->getJson('/api/categories')->assertOk();

    // Flat envelope — no pagination meta.
    expect(array_keys($res->json()))->toBe(['data']);
    $res->assertJsonStructure(['data' => [['id', 'name', 'slug', 'sort_order']]]);

    expect(collect($res->json('data'))->pluck('slug')->all())->toBe(['alpha', 'beta', 'gamma']);

    foreach ($res->json('data') as $row) {
        expect(array_keys($row))->toBe(['id', 'name', 'slug', 'sort_order']);
        expect($row['sort_order'])->toBeInt();
    }
});
