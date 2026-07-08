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
        Schema::create('seller_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('project_name');
            $table->string('url');
            $table->unsignedInteger('asking_price_cents');
            $table->unsignedInteger('mrr_cents');
            $table->text('description');
            $table->enum('status', ['new', 'in_review', 'approved', 'rejected'])->default('new');
            $table->text('admin_notes')->nullable(); // filled during admin review
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_submissions');
    }
};
