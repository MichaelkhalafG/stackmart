<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full listing-detail serializer for GET /api/products/{slug}.
 *
 * Owns the entire detail JSON shape (Planning/12_API_Specification.md). A single
 * `new ProductResource($product)` is wrapped by Laravel as `{ "data": { ... } }`.
 *
 * Exposes `demo_url` and `repository_url` — plain nullable HTTPS URLs, passed
 * through as JSON `null` when unset so the frontend simply hides the button
 * (never a Git-provider integration; see CLAUDE.md demo/repo rule).
 *
 * @property \App\Models\Product $resource
 */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'price_cents' => $this->price_cents,
            'currency' => $this->currency,
            'status' => $this->status,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
            // Nullable showcase links — JSON null when unset (frontend hides the button).
            'demo_url' => $this->demo_url,
            'repository_url' => $this->repository_url,
            // JSON columns are already array-cast on the model (J1.02) — emit as-is.
            'images' => $this->images,
            'tech_stack' => $this->tech_stack,
            'metrics' => $this->metrics,
            'included' => $this->included,
            'faq' => $this->faq,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->toISOString(),
        ];
    }
}
