<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * PATCH /api/auth/profile — update the CURRENT user's display name.
 *
 * Only the name is editable here. Email is deliberately NOT changeable in this endpoint: changing
 * a login identity needs a verification round-trip, which is out of scope — and silently allowing
 * it would let a stolen session lock the real owner out of their account.
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        // The route is behind auth:sanctum and the controller only ever touches $request->user().
        return true;
    }

    /**
     * @return array<string, string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:255',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Enter your name.',
            'name.min' => 'Your name must be at least 2 characters.',
        ];
    }
}
