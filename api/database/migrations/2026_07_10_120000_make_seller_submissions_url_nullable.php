<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * J3.01 corrective migration (DR-6, Option A — approved 2026-07-10).
 *
 * The frozen API contract (Planning/12_API_Specification.md) types the seller
 * submission `url` as `nullable|url:https`, but the Day-1 create migration declared
 * it NOT NULL. A seller with no public URL therefore validated but failed to insert
 * (500). This forward, non-destructive migration makes the column nullable so the
 * schema matches the contract. Non-destructive: seeded rows already set `url`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seller_submissions', function (Blueprint $table) {
            $table->string('url')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Revert to NOT NULL. Any null urls must be backfilled before rolling back.
        Schema::table('seller_submissions', function (Blueprint $table) {
            $table->string('url')->nullable(false)->change();
        });
    }
};
