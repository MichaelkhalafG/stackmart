<?php

namespace App\Filament\Resources\SubmissionResource\Pages;

use App\Filament\Resources\SubmissionResource;
use App\Models\SellerSubmission;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\HtmlString;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EditSubmission extends EditRecord
{
    protected static string $resource = SubmissionResource::class;

    /** The private disk holding the submission's uploads. */
    private const PRIVATE_DISK = 'deliverables';

    /**
     * Header actions for reviewing a submission.
     *
     * - Download ZIP / README stream the seller's uploads from the PRIVATE disk. They are never
     *   given a public URL; only an authenticated admin inside the Filament panel can reach them.
     * - "Reveal payout details" shows the DECRYPTED payout identifier in a modal. It is masked
     *   everywhere else, so an admin never has the seller's full bank details on screen by accident
     *   (e.g. while screen-sharing).
     * - "Create listing" is the publish path: once APPROVED, it links to the ProductResource create
     *   form. It NEVER auto-creates a Product — the admin still fills in and submits that form.
     */
    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('download_zip')
                ->label('Download ZIP')
                ->icon('heroicon-o-archive-box-arrow-down')
                ->color('gray')
                ->visible(fn (): bool => filled($this->record->deliverable_path))
                ->action(fn (): ?StreamedResponse => $this->downloadPrivate(
                    $this->record->deliverable_path,
                    $this->record->project_name.'.zip',
                )),

            Actions\Action::make('download_readme')
                ->label('Download README')
                ->icon('heroicon-o-document-text')
                ->color('gray')
                ->visible(fn (): bool => filled($this->record->readme_path))
                ->action(fn (): ?StreamedResponse => $this->downloadPrivate(
                    $this->record->readme_path,
                    $this->record->project_name.'-verification.'.pathinfo((string) $this->record->readme_path, PATHINFO_EXTENSION),
                )),

            Actions\Action::make('reveal_payout')
                ->label('Reveal payout details')
                ->icon('heroicon-o-eye')
                ->color('danger')
                ->visible(fn (): bool => filled($this->record->payout_identifier))
                ->modalHeading('Payout details')
                ->modalDescription('Sensitive. Transfer the seller\'s share to this destination, then record the payout on the order.')
                ->modalSubmitAction(false)
                ->modalCancelActionLabel('Close')
                ->modalContent(function (): HtmlString {
                    /** @var SellerSubmission $record */
                    $record = $this->record;

                    $rows = [
                        'Method' => match ($record->payout_method) {
                            SellerSubmission::PAYOUT_BANK => 'Bank transfer',
                            SellerSubmission::PAYOUT_PAYPAL => 'PayPal',
                            default => '—',
                        },
                        'Account holder' => $record->payout_holder_name ?? '—',
                        'Identifier' => $record->payout_identifier ?? '—',
                        'Bank' => $record->payout_bank_name ?? '—',
                    ];

                    $html = '<div class="space-y-2 text-sm">';
                    foreach ($rows as $label => $value) {
                        $html .= '<div class="flex justify-between gap-4">'
                            .'<span class="text-gray-500">'.e($label).'</span>'
                            .'<span class="font-mono font-medium">'.e((string) $value).'</span>'
                            .'</div>';
                    }
                    $html .= '</div>';

                    return new HtmlString($html);
                }),

            Actions\Action::make('create_listing')
                ->label('Create listing')
                ->icon('heroicon-o-rectangle-stack')
                ->color('success')
                ->visible(fn (): bool => $this->record->status === SellerSubmission::STATUS_APPROVED)
                ->url(fn (): string => SubmissionResource::productCreateUrl($this->record))
                ->openUrlInNewTab(),
        ];
    }

    /**
     * Stream a file from the PRIVATE disk to the admin. Returns null (and warns) if the path is
     * missing on disk, rather than throwing a 500 at the admin.
     */
    private function downloadPrivate(?string $path, string $downloadName): ?StreamedResponse
    {
        if ($path === null || $path === '' || ! Storage::disk(self::PRIVATE_DISK)->exists($path)) {
            \Filament\Notifications\Notification::make()
                ->title('File not found on the private disk')
                ->danger()
                ->send();

            return null;
        }

        return Storage::disk(self::PRIVATE_DISK)->download($path, $downloadName);
    }
}
