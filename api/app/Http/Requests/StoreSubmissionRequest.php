<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the public POST /api/submissions body (J3.01).
 *
 * Public endpoint — anyone may submit a project for admin review, so authorize()
 * is always true. All validation lives here (Planning/09_Backend_Architecture.md:
 * Form Requests own validation), keeping SubmissionController thin.
 *
 * `url` follows the demo/repo rule: nullable|url:https — only an HTTPS URL or an
 * absent/empty value passes; http/ftp/ssh/garbage are rejected. The two cents
 * columns are NOT NULL integers ≥ 0 (frozen schema, Day 1).
 */
class StoreSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'project_name' => 'required|string|max:255',
            'url' => 'nullable|url:https',
            'asking_price_cents' => 'required|integer|min:0',
            'mrr_cents' => 'required|integer|min:0',
            'description' => 'required|string',
        ];
    }
}
