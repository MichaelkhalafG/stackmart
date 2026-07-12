<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates POST /api/checkout (routes/commerce.php) — Bearer-authenticated buyer.
 *
 * The route is behind `auth:sanctum`, so authorize() is always true; this only shapes the
 * body. The controller additionally guards that the product is PUBLISHED (purchasable).
 */
class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ];
    }
}
