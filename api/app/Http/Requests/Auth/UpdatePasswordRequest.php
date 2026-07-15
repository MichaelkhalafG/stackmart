<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * PATCH /api/auth/password — change the CURRENT user's password.
 *
 * Requires the CURRENT password (verified in the controller with Hash::check) so a stolen but
 * still-valid session cannot silently take over the account by rotating the password. The new
 * password must be confirmed (`password_confirmation`).
 */
class UpdatePasswordRequest extends FormRequest
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
        return [
            'current_password' => 'required|string',
            // `confirmed` pairs with `password_confirmation` in the body.
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'Enter your current password.',
            'password.required' => 'Choose a new password.',
            'password.min' => 'Your new password must be at least 8 characters.',
            'password.confirmed' => "Your new passwords don't match.",
        ];
    }
}
