<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates POST /api/auth/login (routes/auth.php) — public, rate-limited.
 *
 * Only shapes the input; credential verification (and the 422 on a bad match)
 * happens in the controller so a wrong password is not leaked as a field error
 * distinguishable from an unknown email.
 */
class LoginRequest extends FormRequest
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
            'password' => ['required', 'string'],
        ];
    }
}
