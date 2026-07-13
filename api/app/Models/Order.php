<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    /**
     * Order status values (orders.status enum).
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';

    /** Payout status values (orders.payout_status enum) — the manual seller transfer. */
    public const PAYOUT_PENDING = 'pending';
    public const PAYOUT_PAID = 'paid';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'amount_cents',
        'currency',
        'status',
        'payment_provider',
        'provider_reference',
        'provider_payment_id',
        'payment_meta',
        'license_key',
        'delivered_at',
        'download_count',
        // Payout accounting (DR-8) — snapshotted at checkout, settled manually by the admin.
        'commission_rate',
        'platform_cut_cents',
        'seller_payout_cents',
        'payout_status',
        'payout_paid_at',
        'payout_proof_path',
        'payout_notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payment_meta' => 'array',
            'delivered_at' => 'datetime',
            'amount_cents' => 'integer',
            'download_count' => 'integer',
            'commission_rate' => 'decimal:3',
            'platform_cut_cents' => 'integer',
            'seller_payout_cents' => 'integer',
            'payout_paid_at' => 'datetime',
        ];
    }

    /**
     * SENSITIVE — payout internals are admin-only. `OrderResource` (the frozen §Buyer shape) never
     * exposes them; hiding them here stops any accidental serialisation from leaking the platform's
     * cut, the seller's payout, or the proof-of-transfer path to a buyer.
     *
     * @var list<string>
     */
    protected $hidden = [
        'commission_rate',
        'platform_cut_cents',
        'seller_payout_cents',
        'payout_status',
        'payout_paid_at',
        'payout_proof_path',
        'payout_notes',
    ];

    /**
     * Split an order amount by the platform commission. Pure arithmetic — no gateway involved, so it
     * works today on the FakePaymentProvider and is unaffected by the eventual provider choice.
     *
     * The platform cut is rounded to the nearest cent and the seller takes the remainder, so the two
     * always sum EXACTLY back to `amount_cents` (no rounding drift, no lost pennies).
     *
     * @return array{platform_cut_cents: int, seller_payout_cents: int}
     */
    public static function splitCommission(int $amountCents, float $commissionRate): array
    {
        $platformCut = (int) round($amountCents * $commissionRate);

        // Clamp defensively: a nonsense rate must never produce a negative payout.
        $platformCut = max(0, min($platformCut, $amountCents));

        return [
            'platform_cut_cents' => $platformCut,
            'seller_payout_cents' => $amountCents - $platformCut,
        ];
    }

    /**
     * The buyer who placed this order.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The product purchased in this order.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
