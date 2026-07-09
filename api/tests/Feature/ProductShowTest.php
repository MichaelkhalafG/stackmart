<?php

use App\Models\Category;
use App\Models\Product;

/*
 * GET /api/products/{slug} — full detail via ProductResource (J2.02).
 * Locks the demo_url / repository_url exposure and the 404 contract.
 */

it('returns the full detail shape with demo_url and repository_url when set', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()
        ->withDemo('https://demo.example.com')
        ->withRepository('https://github.com/acme/widget')
        ->create(['category_id' => $cat->id, 'slug' => 'widget-pro']);

    $res = $this->getJson('/api/products/widget-pro')->assertOk();

    $res->assertJsonStructure([
        'data' => [
            'id', 'title', 'slug', 'tagline', 'description', 'price_cents', 'currency', 'status',
            'category' => ['id', 'name', 'slug'],
            'demo_url', 'repository_url', 'images', 'tech_stack', 'metrics', 'included', 'faq',
            'is_featured', 'published_at',
        ],
    ]);
    $res->assertJsonPath('data.demo_url', 'https://demo.example.com')
        ->assertJsonPath('data.repository_url', 'https://github.com/acme/widget');
});

it('exposes null demo_url and repository_url when unset (keys still present)', function () {
    $cat = Category::factory()->create();
    Product::factory()->published()->create([
        'category_id' => $cat->id, 'slug' => 'bare', 'demo_url' => null, 'repository_url' => null,
    ]);

    $res = $this->getJson('/api/products/bare')->assertOk();

    expect($res->json('data'))->toHaveKeys(['demo_url', 'repository_url']);
    expect($res->json('data.demo_url'))->toBeNull();
    expect($res->json('data.repository_url'))->toBeNull();
});

it('returns 404 for an unknown slug', function () {
    $this->getJson('/api/products/does-not-exist')->assertNotFound();
});

it('returns 404 for a non-published (draft) slug', function () {
    $cat = Category::factory()->create();
    Product::factory()->create(['category_id' => $cat->id, 'slug' => 'hidden-draft']); // draft

    $this->getJson('/api/products/hidden-draft')->assertNotFound();
});
