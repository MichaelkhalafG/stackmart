<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Mail\SubmissionReceived;
use App\Models\SellerSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Public seller-submission endpoint (routes/catalog.php) — no auth.
 *
 * Thin by design (Planning/09_Backend_Architecture.md): validate via Form Request, persist via
 * Eloquent, notify the admin, return an API Resource. No service layer.
 *
 * STORAGE (DR-8) — everything the seller uploads lands on the PRIVATE `deliverables` disk
 * (config/filesystems.php: local driver, visibility private, `serve` disabled, no `url`). Nothing is
 * web-reachable and nothing is served publicly:
 *
 *   ZIP      submissions/{uuid}/deliverable/…   private; copied to the product on approval
 *   README   submissions/{uuid}/readme/…        private; admin-only verification material
 *   images   submissions/{uuid}/images/…        PRIVATE UNTIL APPROVAL (security S2) — copied to
 *                                               the public disk only when the listing is created
 *
 * Why images are private on submission: most submissions are never approved. Writing them straight
 * to the public disk would leave images from rejected / never-published projects on a guessable
 * public URL forever. Same end state, no exposure window.
 *
 * Filenames are hashed by `store()` — the seller's original filename is NEVER used as a path
 * component, so a hostile name can neither traverse nor collide.
 */
class SubmissionController extends Controller
{
    /** The private disk (the same one that holds product deliverables). */
    private const PRIVATE_DISK = 'deliverables';

    /**
     * POST /api/submissions — record a seller's project for admin review.
     *
     * Accepts multipart/form-data. Persists a seller_submissions row with status=new, stores the
     * uploads privately, fires SubmissionReceived to the admin, and returns the FROZEN contract
     * shape (Planning/12_API_Specification.md) — UNCHANGED by DR-8:
     *
     *   { data: { id, status }, message: "Submission received." }   (201)
     *
     * No path, no payout field and no seller internal ever appears in that body.
     */
    public function store(StoreSubmissionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // A per-submission, non-guessable prefix; store() hashes the filename on top of it.
        $prefix = 'submissions/'.Str::uuid()->toString();

        /** @var array<int, UploadedFile> $images */
        $images = $request->file('images', []);

        $submission = SellerSubmission::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'project_name' => $validated['project_name'],
            'category_id' => $validated['category_id'],
            'url' => $validated['url'] ?? null,
            'asking_price_cents' => $validated['asking_price_cents'],
            'mrr_cents' => $validated['mrr_cents'],
            'description' => $validated['description'],

            // Uploads — all private.
            'deliverable_path' => $this->storePrivately($request->file('deliverable'), $prefix.'/deliverable'),
            'readme_path' => $this->storePrivately($request->file('readme'), $prefix.'/readme'),
            'images' => $this->storeImagesPrivately($images, $prefix.'/images'),

            'tech_stack' => $validated['tech_stack'] ?? null,
            'metrics' => $validated['metrics'] ?? null,

            // Flat platform commission for every seller (DR-8 final): 20%.
            'commission_rate' => config('payments.commission_rate', 0.200),

            // Payout destination — `payout_identifier` is encrypted at rest by the model cast.
            'payout_method' => $validated['payout_method'],
            'payout_holder_name' => $validated['payout_holder_name'],
            'payout_identifier' => $validated['payout_identifier'],
            'payout_bank_name' => $validated['payout_bank_name'] ?? null,

            // The seller accepted the MDN STACKMART terms (validated `accepted`) — record when.
            'terms_accepted_at' => now(),

            'status' => SellerSubmission::STATUS_NEW,
        ]);

        // Admin notification. No dedicated admin-address config exists, so use the app's global
        // "from" address — the standard Laravel "notify the app owner" convention. Inline send
        // (QUEUE=sync); the `log` mailer writes it to the Laravel log in dev.
        Mail::to(config('mail.from.address'))->send(new SubmissionReceived($submission));

        return (new SubmissionResource($submission))
            ->additional(['message' => 'Submission received.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Store one upload on the PRIVATE disk under a hashed filename. Returns the stored path.
     */
    private function storePrivately(?UploadedFile $file, string $directory): ?string
    {
        if (! $file instanceof UploadedFile) {
            return null;
        }

        // store() generates a random hashed filename — the seller's original name is discarded.
        $path = $file->store($directory, self::PRIVATE_DISK);

        return is_string($path) && $path !== '' ? $path : null;
    }

    /**
     * Store the product images on the PRIVATE disk (private-until-approval, security S2).
     *
     * @param  array<int, UploadedFile>  $files
     * @return list<string>
     */
    private function storeImagesPrivately(array $files, string $directory): array
    {
        $paths = [];

        foreach ($files as $file) {
            $path = $this->storePrivately($file, $directory);

            if ($path !== null) {
                $paths[] = $path;
            }
        }

        return $paths;
    }
}
