<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * DR-8 — expand the seller submission intake (Day 6/7).
 *
 * Forward-only and non-destructive: every column is nullable (or defaulted), so existing rows and
 * the seeded catalog keep working untouched.
 *
 * Storage columns hold PATHS only — the files themselves live on the PRIVATE `deliverables` disk:
 *   deliverable_path  the seller's code ZIP           (private)
 *   readme_path       the verification README         (private, admin-only)
 *   images            JSON array of paths             (private UNTIL approval — copied to the
 *                                                      public disk when the listing is created)
 *
 * `payout_identifier` is TEXT, not VARCHAR: Laravel's `encrypted` cast stores base64 ciphertext
 * that is far longer than the plaintext IBAN / PayPal address it wraps.
 *
 * Commission is a FLAT 20% for every seller (DR-8 final): decimal(4,3), default 0.200.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seller_submissions', function (Blueprint $table): void {
            // The category the seller picked (from GET /api/categories). Nullable so the column can
            // be added to existing rows; nullOnDelete keeps a deleted category from orphaning rows.
            $table->foreignId('category_id')->nullable()->after('project_name')
                ->constrained('categories')->nullOnDelete();

            // Uploaded artefacts — private-disk paths, never public, never in an API response.
            $table->string('deliverable_path')->nullable()->after('description');
            $table->string('readme_path')->nullable()->after('deliverable_path');
            $table->json('images')->nullable()->after('readme_path');

            // Listing metadata carried to the product on approval.
            $table->json('tech_stack')->nullable()->after('images');
            $table->json('metrics')->nullable()->after('tech_stack');

            // Flat platform commission (20%) snapshotted onto the product at approval.
            $table->decimal('commission_rate', 4, 3)->default(0.200)->after('metrics');

            // Proof the seller accepted the MDN STACKMART terms at submission time.
            $table->timestamp('terms_accepted_at')->nullable()->after('commission_rate');

            // ── Payout details (SENSITIVE) ────────────────────────────────────────────────
            // Admin-only. Never returned by any public endpoint (SubmissionResource exposes
            // {id,status} only) and hidden on the model. The identifier is encrypted at rest.
            $table->enum('payout_method', ['bank', 'paypal'])->nullable()->after('terms_accepted_at');
            $table->string('payout_holder_name')->nullable()->after('payout_method');
            $table->text('payout_identifier')->nullable()->after('payout_holder_name');
            $table->string('payout_bank_name')->nullable()->after('payout_identifier');
        });
    }

    public function down(): void
    {
        Schema::table('seller_submissions', function (Blueprint $table): void {
            $table->dropForeign(['category_id']);
            $table->dropColumn([
                'category_id',
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
            ]);
        });
    }
};
