<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates POST /api/auth/register (routes/auth.php) — public, rate-limited.
 *
 * Body per the frozen contract (Planning/12_API_Specification.md §Auth): name,
 * email, password. `is_admin` is never accepted from input — the controller sets
 * it to false, so there is no privilege-escalation surface here.
 */
class RegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}
