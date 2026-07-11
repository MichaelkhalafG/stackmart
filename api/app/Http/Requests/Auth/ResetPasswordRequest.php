<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates POST /api/auth/reset-password (routes/auth.php) — public, rate-limited.
 *
 * Shapes the broker credentials (token, email, password). The token/email pairing is
 * verified by Laravel's Password broker in the controller; an invalid or expired
 * token surfaces there as a 422.
 */
class ResetPasswordRequest extends FormRequest
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
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}
