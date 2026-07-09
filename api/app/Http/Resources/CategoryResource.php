<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializes a Category for GET /api/categories — the marketplace filter sidebar
 * and the product form's category select.
 *
 * Exactly the four contract fields (Planning/12_API_Specification.md); no
 * timestamps (the model has none) and no product counts leak.
 *
 * @property \App\Models\Category $resource
 */
class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sort_order' => $this->sort_order,
        ];
    }
}
