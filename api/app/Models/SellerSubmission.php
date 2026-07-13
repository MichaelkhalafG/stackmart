<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerSubmission extends Model
{
    /** @use HasFactory<\Database\Factories\SellerSubmissionFactory> */
    use HasFactory;

    /**
     * Review-workflow status values (seller_submissions.status enum).
     */
    public const STATUS_NEW = 'new';
    public const STATUS_IN_REVIEW = 'in_review';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /** Payout methods (seller_submissions.payout_method enum). */
    public const PAYOUT_BANK = 'bank';
    public const PAYOUT_PAYPAL = 'paypal';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'project_name',
        'category_id',
        'url',
        'asking_price_cents',
        'mrr_cents',
        'description',
        'deliverable_path',
        'readme_path',
        'images',
        'tech_stack',
        'metrics',
        'commission_rate',
        'terms_accepted_at',
        'payout_method',
        'payout_holder_name',
        'payout_identifier',
        'payout_bank_name',
        'status',
        'admin_notes',
    ];

    /**
     * SENSITIVE — never serialised.
     *
     * Defence in depth: `SubmissionResource` already exposes only {id,status}, but hiding these on
     * the model means an accidental `->toArray()` / `->toJson()` anywhere can never leak the private
     * file paths or the seller's financial details.
     *
     * @var list<string>
     */
    protected $hidden = [
        'deliverable_path',
        'readme_path',
        'payout_method',
        'payout_holder_name',
        'payout_identifier',
        'payout_bank_name',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * `payout_identifier` uses the `encrypted` cast — the IBAN / account number / PayPal address is
     * ciphertext at rest and is decrypted only when an admin reads it in Filament.
     *
     * ⚠ This ties the data to APP_KEY: rotating or losing the key makes every stored identifier
     * unrecoverable, and encrypted columns cannot be indexed or searched.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'asking_price_cents' => 'integer',
            'mrr_cents' => 'integer',
            'images' => 'array',
            'tech_stack' => 'array',
            'metrics' => 'array',
            'commission_rate' => 'decimal:3',
            'terms_accepted_at' => 'datetime',
            'payout_identifier' => 'encrypted',
        ];
    }

    /**
     * The category the seller picked for the listing.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * The payout identifier reduced to its last 4 characters, for admin display.
     * Filament shows THIS by default; the full value sits behind an explicit "Reveal" action.
     */
    public function maskedPayoutIdentifier(): ?string
    {
        $identifier = $this->payout_identifier;

        if ($identifier === null || $identifier === '') {
            return null;
        }

        return '•••• '.mb_substr($identifier, -4);
    }

    /**
     * The seller's tech-stack tags flattened to the shape `products.tech_stack` uses (a FLAT list,
     * queried with JSON_CONTAINS). The submission stores it structured — {languages, frameworks,
     * databases} — so the marketplace filter keeps working unchanged after approval.
     *
     * @return list<string>
     */
    public function flatTechStack(): array
    {
        $stack = $this->tech_stack;

        if (! is_array($stack) || $stack === []) {
            return [];
        }

        $values = [];

        foreach ($stack as $group) {
            // Structured group ({languages: [...]}) → flatten. An already-flat array passes through.
            if (is_array($group)) {
                foreach ($group as $item) {
                    if (is_string($item) && $item !== '') {
                        $values[] = $item;
                    }
                }
            } elseif (is_string($group) && $group !== '') {
                $values[] = $group;
            }
        }

        return array_values(array_unique($values));
    }
}
