<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Public catalog endpoints (routes/catalog.php) — no auth.
 *
 * Thin by design: validate via Form Request, query via Eloquent, shape the JSON
 * inline. No service/repository layer (Planning/09_Backend_Architecture.md).
 */
class CatalogController extends Controller
{
    /**
     * GET /api/products — list PUBLISHED products with search/filter/sort/pagination.
     *
     * Response is the frozen contract shape (Planning/12_API_Specification.md):
     * { data: [...], meta: { current_page, last_page, per_page, total } } with per_page = 12.
     */
    public function index(ProductIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $query = Product::query()
            ->with('category') // eager-load to avoid N+1 on the nested category block
            ->where('status', Product::STATUS_PUBLISHED);

        if (! empty($filters['search'])) {
            // Tokenised, case-insensitive LIKE (AND across terms) rather than FULLTEXT: natural-language
            // FULLTEXT only matches whole tokens (min 3–4 chars, no substring), so "launch" missed
            // "LaunchBase". LIKE is fine at catalogue scale; the FULLTEXT index stays but is unused.
            $terms = preg_split('/\s+/', trim($filters['search']), -1, PREG_SPLIT_NO_EMPTY) ?: [];
            $query->where(function ($outer) use ($terms) {
                foreach ($terms as $term) {
                    // Escape LIKE wildcards so a literal % or _ in the query isn't treated as one.
                    $like = '%'.addcslashes($term, '%_\\').'%';
                    $outer->where(fn ($q) => $q->where('title', 'like', $like)
                        ->orWhere('tagline', 'like', $like));
                }
            });
        }

        if (! empty($filters['category'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $filters['category']));
        }

        if (! empty($filters['stack'])) {
            // JSON_CONTAINS on the tech_stack array column — portable across MySQL 8 and MariaDB.
            $query->whereJsonContains('tech_stack', $filters['stack']);
        }

        if (isset($filters['min_price'])) {
            $query->where('price_cents', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price_cents', '<=', $filters['max_price']);
        }

        // Deterministic ordering (id tiebreaker keeps pagination stable across pages).
        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price_cents')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price_cents')->orderBy('id'),
            default => $query->orderByDesc('published_at')->orderByDesc('id'),
        };

        // client-driven page size (mobile 4, desktop 12), bounded; defaults to the contract's 12.
        $perPage = (int) ($filters['per_page'] ?? 12);
        $products = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => collect($products->items())->map(fn (Product $product): array => [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'tagline' => $product->tagline,
                'price_cents' => $product->price_cents,
                'currency' => $product->currency,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
                // Seeded images are raw relative names (placeholders/*.png); the frontend
                // resolves them. cover_image is simply the first image, or null if none.
                'cover_image' => $product->images[0] ?? null,
                'is_featured' => $product->is_featured,
                'status' => $product->status,
            ])->all(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * GET /api/products/{slug} — full listing detail.
     *
     * Resolved by slug via implicit route-model binding (Product's route key is
     * `slug`); an unknown slug yields Laravel's automatic 404. Only PUBLISHED
     * listings are public — a draft/sold slug also 404s (matches the catalog).
     */
    public function show(Product $product): ProductResource
    {
        abort_unless($product->status === Product::STATUS_PUBLISHED, 404);

        $product->load('category');

        return new ProductResource($product);
    }

    /**
     * GET /api/categories — the full taxonomy, ordered by sort_order.
     *
     * Flat `{ data: [...] }` (no pagination) per the contract; powers the
     * marketplace filter sidebar and the product form's category select.
     */
    public function categories(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::orderBy('sort_order')->get()
        );
    }
}
