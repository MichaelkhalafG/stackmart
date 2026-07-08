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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('tagline');
            $table->longText('description');
            $table->unsignedInteger('price_cents');
            $table->char('currency', 3)->default('USD');
            $table->enum('status', ['draft', 'published', 'sold'])->default('draft');
            // Plain HTTPS showcase links (nullable|url:https) — never Git-provider integrations.
            $table->string('demo_url')->nullable();
            $table->string('repository_url')->nullable();
            $table->json('images');
            $table->json('tech_stack');
            $table->json('metrics');
            $table->json('included');
            $table->json('faq')->nullable();
            $table->string('deliverable_path')->nullable(); // path on the private disk
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // FULLTEXT search over title + tagline (MySQL 8 / InnoDB).
            $table->fullText(['title', 'tagline']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
