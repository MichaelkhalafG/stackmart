<?php

namespace App\Http\Requests;

use App\Models\SellerSubmission;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the public POST /api/submissions body (J3.01, expanded by DR-8).
 *
 * Public endpoint — anyone may submit a project for admin review, so authorize() is always true.
 * All validation lives here (Planning/09_Backend_Architecture.md: Form Requests own validation),
 * keeping SubmissionController thin.
 *
 * The request is now **multipart/form-data**: the seller attaches the code ZIP, a verification
 * README and at least one product image, and supplies their payout destination.
 *
 * SECURITY NOTES
 * - `deliverable` is checked BOTH by extension (`mimes:zip`) and by sniffed content type
 *   (`mimetypes:`), because an extension alone proves nothing. The archive is never extracted or
 *   executed — it is stored and later streamed as bytes.
 * - Sizes are capped (`max:` units are KILOBYTES): ZIP 100 MB, README 10 MB, images 5 MB × 8.
 * - `payout_identifier` is an IBAN / account number / PayPal address. It is encrypted at rest
 *   (model cast) and never leaves the admin panel.
 *
 * `url` keeps the demo/repo rule: nullable|url:https.
 */
class StoreSubmissionRequest extends FormRequest
{
    /** ZIP 100 MB · README 10 MB · images 5 MB each (validator sizes are in kilobytes). */
    private const MAX_DELIVERABLE_KB = 102400;
    private const MAX_README_KB = 10240;
    private const MAX_IMAGE_KB = 5120;
    private const MAX_IMAGES = 8;

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
            // ── Existing frozen fields ────────────────────────────────────────────────────
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'project_name' => 'required|string|max:255',
            'url' => 'nullable|url:https',
            'asking_price_cents' => 'required|integer|min:0',
            'mrr_cents' => 'required|integer|min:0',
            'description' => 'required|string',

            // ── Listing metadata (DR-8) ───────────────────────────────────────────────────
            'category_id' => 'required|integer|exists:categories,id',

            // Structured tags — flattened onto products.tech_stack (a flat JSON_CONTAINS list)
            // when the listing is created, so the marketplace stack filter keeps working.
            'tech_stack' => 'nullable|array',
            'tech_stack.languages' => 'nullable|array|max:25',
            'tech_stack.languages.*' => 'string|max:50',
            'tech_stack.frameworks' => 'nullable|array|max:25',
            'tech_stack.frameworks.*' => 'string|max:50',
            'tech_stack.databases' => 'nullable|array|max:25',
            'tech_stack.databases.*' => 'string|max:50',

            // Optional business metrics — carried to products.metrics.
            'metrics' => 'nullable|array',
            'metrics.mrr' => 'nullable|integer|min:0',
            'metrics.users' => 'nullable|integer|min:0',
            'metrics.traffic' => 'nullable|integer|min:0',

            // ── Required uploads (DR-8) ───────────────────────────────────────────────────
            // Extension AND sniffed mime: renaming payload.exe → payload.zip must fail.
            'deliverable' => [
                'required',
                'file',
                'mimes:zip',
                'mimetypes:application/zip,application/x-zip-compressed,multipart/x-zip',
                'max:'.self::MAX_DELIVERABLE_KB,
            ],

            // How our team verifies the listing (repo access, analytics, staging creds…).
            // Admin-only, private disk — never public, never in an API response.
            'readme' => [
                'required',
                'file',
                'mimes:md,txt,pdf',
                'max:'.self::MAX_README_KB,
            ],

            'images' => 'required|array|min:1|max:'.self::MAX_IMAGES,
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:'.self::MAX_IMAGE_KB,

            // ── Payout destination (SENSITIVE, DR-8) ──────────────────────────────────────
            'payout_method' => 'required|in:'.SellerSubmission::PAYOUT_BANK.','.SellerSubmission::PAYOUT_PAYPAL,
            'payout_holder_name' => 'required_with:payout_method|string|max:255',
            'payout_identifier' => 'required_with:payout_method|string|max:255',
            'payout_bank_name' => 'nullable|string|max:255',

            // MDN STACKMART terms — must be explicitly accepted; persisted as terms_accepted_at.
            'terms_accepted' => 'accepted',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'deliverable.mimes' => 'The deliverable must be a .zip archive.',
            'deliverable.mimetypes' => 'The deliverable must be a real .zip archive.',
            'deliverable.max' => 'The deliverable may not be larger than 100 MB.',
            'readme.mimes' => 'The README must be a .md, .txt or .pdf file.',
            'readme.max' => 'The README may not be larger than 10 MB.',
            'images.required' => 'Add at least one product image.',
            'images.*.max' => 'Each image may not be larger than 5 MB.',
            'terms_accepted.accepted' => 'You must accept the MDN STACKMART terms to submit.',
        ];
    }
}
