<?php

use App\Models\Category;
use App\Models\Product;

/*
 * GET /api/products — the catalog index (J2.01).
 * Assertions are on membership / counts / field presence only — never on
 * engine-specific FULLTEXT relevance ranking or JSON internals, so the suite
 * passes on both local MariaDB and MySQL 8.
 */

it('returns only published products in the {data,meta} shape', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()->count(2)->create(['category_id' => $cat->id]);
    Product::factory()->create(['category_id' => $cat->id]);                                  // draft
    Product::factory()->create(['category_id' => $cat->id, 'status' => Product::STATUS_SOLD]); // sold

    $res = $this->getJson('/api/products')->assertOk();

    $res->assertJsonStructure([
        'data' => [[
            'id', 'title', 'slug', 'tagline', 'price_cents', 'currency',
            'category' => ['id', 'name', 'slug'],
            'cover_image', 'is_featured', 'status',
        ]],
        'meta' => ['current_page', 'last_page', 'per_page', 'total'],
    ]);
    expect($res->json('meta.per_page'))->toBe(12);
    expect($res->json('meta.total'))->toBe(2);
    expect(collect($res->json('data'))->pluck('status')->unique()->all())->toBe(['published']);
});

it('filters by category slug', function () {
    $a = Category::factory()->create(['slug' => 'cat-a']);
    $b = Category::factory()->create(['slug' => 'cat-b']);
    Product::factory()->published()->count(2)->create(['category_id' => $a->id]);
    Product::factory()->published()->create(['category_id' => $b->id]);

    $res = $this->getJson('/api/products?category=cat-a')->assertOk();

    expect($res->json('meta.total'))->toBe(2);
    expect(collect($res->json('data'))->pluck('category.slug')->unique()->all())->toBe(['cat-a']);
});

it('filters by stack via JSON_CONTAINS (membership, not order)', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()->create(['category_id' => $cat->id, 'tech_stack' => ['Laravel', 'MySQL']]);
    Product::factory()->published()->create(['category_id' => $cat->id, 'tech_stack' => ['Laravel', 'Redis']]);
    Product::factory()->published()->create(['category_id' => $cat->id, 'tech_stack' => ['Vue', 'Node.js']]);

    $res = $this->getJson('/api/products?stack=Laravel')->assertOk();

    expect($res->json('meta.total'))->toBe(2);
});

it('filters by inclusive min_price and max_price', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()->create(['category_id' => $cat->id, 'price_cents' => 100000]);
    Product::factory()->published()->create(['category_id' => $cat->id, 'price_cents' => 500000]);
    Product::factory()->published()->create(['category_id' => $cat->id, 'price_cents' => 900000]);

    expect($this->getJson('/api/products?min_price=500000')->assertOk()->json('meta.total'))->toBe(2); // 500k + 900k
    expect($this->getJson('/api/products?max_price=500000')->assertOk()->json('meta.total'))->toBe(2); // 100k + 500k
    expect($this->getJson('/api/products?min_price=500000&max_price=500000')->assertOk()->json('meta.total'))->toBe(1);
});

it('searches title and tagline via FULLTEXT (presence + absence, not rank)', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()->create([
        'category_id' => $cat->id, 'title' => 'Quantum Ledger', 'slug' => 'quantum-ledger',
        'tagline' => 'Distributed accounting engine for finance teams',
    ]);
    Product::factory()->published()->create([
        'category_id' => $cat->id, 'title' => 'Zephyr Mailer', 'slug' => 'zephyr-mailer',
        'tagline' => 'Transactional email delivery service',
    ]);

    $slugs = collect($this->getJson('/api/products?search=Quantum')->assertOk()->json('data'))->pluck('slug');

    expect($slugs)->toContain('quantum-ledger');
    expect($slugs)->not->toContain('zephyr-mailer');
});

it('sorts by price ascending and descending', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()->create(['category_id' => $cat->id, 'price_cents' => 300000]);
    Product::factory()->published()->create(['category_id' => $cat->id, 'price_cents' => 100000]);
    Product::factory()->published()->create(['category_id' => $cat->id, 'price_cents' => 900000]);

    expect($this->getJson('/api/products?sort=price_asc')->assertOk()->json('data.0.price_cents'))->toBe(100000);
    expect($this->getJson('/api/products?sort=price_desc')->assertOk()->json('data.0.price_cents'))->toBe(900000);
});

it('sorts by newest (published_at desc) by default', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()->create(['category_id' => $cat->id, 'slug' => 'older', 'published_at' => now()->subDays(10)]);
    Product::factory()->published()->create(['category_id' => $cat->id, 'slug' => 'newer', 'published_at' => now()->subDay()]);

    expect($this->getJson('/api/products')->assertOk()->json('data.0.slug'))->toBe('newer');
});

it('paginates 12 per page', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()->count(13)->create(['category_id' => $cat->id]);

    $p1 = $this->getJson('/api/products')->assertOk();
    expect($p1->json('data'))->toHaveCount(12);
    expect($p1->json('meta.total'))->toBe(13);
    expect($p1->json('meta.last_page'))->toBe(2);
    expect($p1->json('meta.current_page'))->toBe(1);

    $p2 = $this->getJson('/api/products?page=2')->assertOk();
    expect($p2->json('data'))->toHaveCount(1);
    expect($p2->json('meta.current_page'))->toBe(2);
});

it('rejects invalid query params with 422', function () {
    $this->getJson('/api/products?sort=cheapest')->assertStatus(422);
    $this->getJson('/api/products?min_price=-5')->assertStatus(422);
    $this->getJson('/api/products?page=abc')->assertStatus(422);
});
