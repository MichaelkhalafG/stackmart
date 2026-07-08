<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    /**
     * Lifecycle status values (products.status enum) — see Planning/16_Product_Flow.md.
     */
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_SOLD = 'sold';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'tagline',
        'description',
        'price_cents',
        'currency',
        'status',
        'demo_url',
        'repository_url',
        'images',
        'tech_stack',
        'metrics',
        'included',
        'faq',
        'deliverable_path',
        'is_featured',
        'published_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'images' => 'array',
            'tech_stack' => 'array',
            'metrics' => 'array',
            'included' => 'array',
            'faq' => 'array',
            'price_cents' => 'integer',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Public detail pages resolve products by slug, not id
     * (per Planning/16_Product_Flow.md).
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * The category this product belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * The orders placed for this product.
     *
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
