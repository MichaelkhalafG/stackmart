<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedInteger('amount_cents'); // snapshot at purchase
            $table->char('currency', 3)->default('USD');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            // Provider-agnostic: a provider KEY (e.g. "fake"), never a gateway-specific schema.
            $table->string('payment_provider');
            $table->string('provider_reference')->unique(); // universal correlation key → webhook idempotency
            $table->string('provider_payment_id')->nullable();
            $table->json('payment_meta')->nullable();
            $table->string('license_key')->nullable(); // XXXX-XXXX-XXXX-XXXX, set on fulfillment
            $table->timestamp('delivered_at')->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
