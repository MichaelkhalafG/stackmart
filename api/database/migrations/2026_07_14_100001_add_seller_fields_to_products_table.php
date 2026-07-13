<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * DR-8 — carry the seller's identity and commission onto the product at approval.
 *
 * There are no seller accounts (admin-curated, one-sided marketplace), so there is nothing to join
 * to: the seller is DENORMALISED onto the product when the admin creates the listing from an
 * approved submission. This is what later lets `orders → product → seller` resolve for payouts.
 *
 * Forward-only: all columns nullable or defaulted, so the seeded catalog is unaffected.
 * NONE of these are public — ProductResource never exposes them.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            // Provenance: which submission this listing came from (null for admin-authored listings).
            $table->foreignId('seller_submission_id')->nullable()->after('id')
                ->constrained('seller_submissions')->nullOnDelete();

            // Denormalised seller identity — the payee for this product's orders.
            $table->string('seller_name')->nullable()->after('seller_submission_id');
            $table->string('seller_email')->nullable()->after('seller_name');

            // Flat 20% platform commission, snapshotted onto each order at checkout.
            $table->decimal('commission_rate', 4, 3)->default(0.200)->after('seller_email');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropForeign(['seller_submission_id']);
            $table->dropColumn(['seller_submission_id', 'seller_name', 'seller_email', 'commission_rate']);
        });
    }
};
