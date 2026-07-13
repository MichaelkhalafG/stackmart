<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use App\Models\Product;
use App\Models\SellerSubmission;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Create a listing — optionally FROM an approved seller submission (DR-8).
 *
 * The submission's "Create listing" action links here with `?submission={id}`. When that param is
 * present we:
 *   1. PRE-FILL the create form from the submission (title, price, category, description, stack…);
 *   2. after the admin submits the form, TRANSFER the seller's uploads onto the new product —
 *        • the code ZIP is copied within the PRIVATE disk → products.deliverable_path
 *        • the images are copied PRIVATE → PUBLIC disk    → products.images
 *      and carry the seller identity + commission across so payouts can resolve.
 *
 * The locked rule still holds: **we never auto-create a Product.** The admin fills in and submits
 * the create form; this class only pre-fills it and moves the files afterwards — no manual re-upload.
 */
class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;

    private const PRIVATE_DISK = 'deliverables';
    private const PUBLIC_DISK = 'public';

    /** The approved submission this listing is being created from, if any. */
    protected function submission(): ?SellerSubmission
    {
        $id = request()->query('submission');

        if ($id === null || ! is_numeric($id)) {
            return null;
        }

        return SellerSubmission::find((int) $id);
    }

    /**
     * Pre-fill the create form from the submission (Filament fills an empty form by default).
     */
    protected function fillForm(): void
    {
        $submission = $this->submission();

        if ($submission === null) {
            parent::fillForm();

            return;
        }

        $this->callHook('beforeFill');

        $this->form->fill([
            'title' => $submission->project_name,
            'slug' => Str::slug($submission->project_name),
            'category_id' => $submission->category_id,
            'description' => $submission->description,
            'price_cents' => $submission->asking_price_cents,
            'demo_url' => $submission->url,
            // Flatten {languages, frameworks, databases} → the flat list products.tech_stack uses,
            // so the marketplace JSON_CONTAINS stack filter keeps working unchanged.
            'tech_stack' => $submission->flatTechStack(),
            'metrics' => $this->metricsFor($submission),
            'status' => Product::STATUS_DRAFT,
        ]);

        $this->callHook('afterFill');
    }

    /**
     * After the admin creates the product, move the seller's files onto it and record the seller.
     */
    protected function afterCreate(): void
    {
        $submission = $this->submission();

        if ($submission === null) {
            return;
        }

        /** @var Product $product */
        $product = $this->record;

        $attributes = [
            // Seller provenance — with no seller accounts, THIS is the payee record for payouts.
            'seller_submission_id' => $submission->id,
            'seller_name' => $submission->name,
            'seller_email' => $submission->email,
            'commission_rate' => $submission->commission_rate,
        ];

        // 1. The code ZIP — copied WITHIN the private disk (the submission keeps its original for
        //    audit). Never public; the buyer only ever reaches it through the authenticated,
        //    owner-checked download endpoint.
        if (filled($submission->deliverable_path)
            && Storage::disk(self::PRIVATE_DISK)->exists($submission->deliverable_path)
            && blank($product->deliverable_path)) {
            $target = 'products/'.$product->id.'/'.basename($submission->deliverable_path);

            if (Storage::disk(self::PRIVATE_DISK)->copy($submission->deliverable_path, $target)) {
                $attributes['deliverable_path'] = $target;
            }
        }

        // 2. The images — PRIVATE → PUBLIC. They were held privately until now precisely so an
        //    unapproved submission's images could never sit on a guessable public URL (security S2).
        //    Now that this IS a listing, they become the public gallery.
        $existingImages = is_array($product->images) ? $product->images : [];

        if ($existingImages === [] && is_array($submission->images) && $submission->images !== []) {
            $published = [];

            foreach ($submission->images as $path) {
                if (! is_string($path) || ! Storage::disk(self::PRIVATE_DISK)->exists($path)) {
                    continue;
                }

                $target = 'products/'.$product->id.'/'.basename($path);
                $bytes = Storage::disk(self::PRIVATE_DISK)->get($path);

                if ($bytes !== null && Storage::disk(self::PUBLIC_DISK)->put($target, $bytes)) {
                    $published[] = $target;
                }
            }

            if ($published !== []) {
                $attributes['images'] = $published;
            }
        }

        $product->forceFill($attributes)->save();

        Notification::make()
            ->title('Listing created from submission #'.$submission->id)
            ->body("The seller's ZIP and images were transferred automatically — no re-upload needed.")
            ->success()
            ->send();
    }

    /**
     * The submission's metrics mapped onto the products.metrics shape ({mrr, users, founded,
     * profit} plus the new `traffic` key). Only keys the seller actually supplied are carried.
     *
     * @return array<string, int>
     */
    private function metricsFor(SellerSubmission $submission): array
    {
        $metrics = is_array($submission->metrics) ? $submission->metrics : [];
        $carried = [];

        foreach (['mrr', 'users', 'traffic'] as $key) {
            if (isset($metrics[$key]) && $metrics[$key] !== null && $metrics[$key] !== '') {
                $carried[$key] = (int) $metrics[$key];
            }
        }

        return $carried;
    }
}
