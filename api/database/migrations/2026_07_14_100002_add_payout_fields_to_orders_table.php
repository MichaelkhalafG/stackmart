<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * DR-8 — payout accounting on the order (NO new table; the 5-table rule holds).
 *
 * One product per order (no cart) ⇒ exactly ONE payout per paid order, so payout state lives on the
 * order itself rather than in a 6th table.
 *
 * The money is SNAPSHOTTED at checkout, never derived at read time: if a product's commission ever
 * changes, historical payouts must not silently change with it.
 *
 *   platform_cut_cents  = round(amount_cents × commission_rate)
 *   seller_payout_cents = amount_cents − platform_cut_cents
 *
 * This is pure arithmetic — it works today on the FakePaymentProvider and is entirely independent of
 * which payment provider is eventually chosen.
 *
 * Defaults keep every existing order (and the factories/seeders) valid without a backfill.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->decimal('commission_rate', 4, 3)->default(0.200)->after('amount_cents');
            $table->unsignedInteger('platform_cut_cents')->default(0)->after('commission_rate');
            $table->unsignedInteger('seller_payout_cents')->default(0)->after('platform_cut_cents');

            // Manual, out-of-band transfer: the admin pays the seller, then records it here.
            $table->enum('payout_status', ['pending', 'paid'])->default('pending')->after('seller_payout_cents');
            $table->timestamp('payout_paid_at')->nullable()->after('payout_status');

            // Proof-of-transfer image — a financial document, so it lives on the PRIVATE disk.
            $table->string('payout_proof_path')->nullable()->after('payout_paid_at');
            $table->text('payout_notes')->nullable()->after('payout_proof_path');

            $table->index('payout_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropIndex(['payout_status']);
            $table->dropColumn([
                'commission_rate',
                'platform_cut_cents',
                'seller_payout_cents',
                'payout_status',
                'payout_paid_at',
                'payout_proof_path',
                'payout_notes',
            ]);
        });
    }
};
