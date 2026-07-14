<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * License-gated download request — POST /api/orders/{order}/download.
 *
 * The buyer must present the license key they were given at fulfillment. This is an EXTRA layer on
 * top of the existing checks (Sanctum auth + ownership + order paid), never a replacement for them:
 * the controller still enforces all three before it even looks at the key.
 *
 * Authorization lives in the controller (owner + paid), so this only shapes the input.
 */
class DownloadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, string>
     */
    public function rules(): array
    {
        // The key is the fulfillment format XXXX-XXXX-XXXX-XXXX; `max` keeps a hostile payload small.
        return [
            'license_key' => 'required|string|max:64',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'license_key.required' => 'Enter the license key from your purchase confirmation email.',
        ];
    }
}
