<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Mail\SubmissionReceived;
use App\Models\SellerSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

/**
 * Public seller-submission endpoint (routes/catalog.php) — no auth.
 *
 * Thin by design (Planning/09_Backend_Architecture.md): validate via Form Request,
 * persist via Eloquent, notify the admin, return an API Resource. No service layer.
 */
class SubmissionController extends Controller
{
    /**
     * POST /api/submissions — record a seller's project for admin review.
     *
     * Persists a seller_submissions row with status=new, fires SubmissionReceived
     * to the admin (log driver in dev), and returns the frozen contract shape
     * (Planning/12_API_Specification.md):
     *   { data: { id, status }, message: "Submission received." }  (201)
     */
    public function store(StoreSubmissionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = SellerSubmission::STATUS_NEW;

        $submission = SellerSubmission::create($data);

        // Admin notification. No dedicated admin-address config exists (config/ is
        // owned), so use the app's global "from" address — the standard
        // Laravel "notify the app owner" convention. Inline send (QUEUE=sync); the
        // `log` mailer writes it to the Laravel log in dev.
        Mail::to(config('mail.from.address'))->send(new SubmissionReceived($submission));

        return (new SubmissionResource($submission))
            ->additional(['message' => 'Submission received.'])
            ->response()
            ->setStatusCode(201);
    }
}
