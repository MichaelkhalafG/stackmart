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
        // Seller provenance (DR-8) — denormalised from the submission at approval. There are no
        // seller accounts, so this IS the seller record for payout purposes. NEVER public.
        'seller_submission_id',
        'seller_name',
        'seller_email',
        'commission_rate',
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
            'commission_rate' => 'decimal:3',
        ];
    }

    /**
     * SENSITIVE — the seller's identity and the platform's cut are internal. `ProductResource`
     * never exposes them; hiding them here means an accidental `->toArray()` can't leak them either.
     *
     * @var list<string>
     */
    protected $hidden = [
        'seller_submission_id',
        'seller_name',
        'seller_email',
        'commission_rate',
    ];

    /**
     * The seller submission this listing was created from (null for admin-authored listings).
     * This is the ONLY place the seller's payout details live — the admin reads them from here at
     * transfer time (DR-8).
     *
     * @return BelongsTo<SellerSubmission, $this>
     */
    public function sellerSubmission(): BelongsTo
    {
        return $this->belongsTo(SellerSubmission::class);
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
