<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'project_name',
        'url',
        'asking_price_cents',
        'mrr_cents',
        'description',
        'status',
        'admin_notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'asking_price_cents' => 'integer',
            'mrr_cents' => 'integer',
        ];
    }
}
