<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializes a SellerSubmission for POST /api/submissions (J3.01).
 *
 * Deliberately minimal — the public create response exposes EXACTLY { id, status }
 * (Planning/12_API_Specification.md). No email, price, or admin_notes leak back to
 * the anonymous submitter. The "message" envelope is attached by the controller via
 * ->additional(), producing { data: { id, status }, message: "Submission received." }.
 *
 * @property \App\Models\SellerSubmission $resource
 */
class SubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
        ];
    }
}
