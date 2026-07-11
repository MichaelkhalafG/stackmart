<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates POST /api/auth/forgot-password (routes/auth.php) — public, rate-limited.
 *
 * Only the email shape is checked. The controller ALWAYS returns the same generic
 * response whether or not the address exists, so this endpoint never reveals which
 * emails are registered (no user enumeration).
 */
class ForgotPasswordRequest extends FormRequest
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
            'email' => ['required', 'string', 'email'],
        ];
    }
}
