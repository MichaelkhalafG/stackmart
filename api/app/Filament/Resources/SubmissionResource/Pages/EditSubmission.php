<?php

namespace App\Filament\Resources\SubmissionResource\Pages;

use App\Filament\Resources\SubmissionResource;
use App\Models\SellerSubmission;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSubmission extends EditRecord
{
    protected static string $resource = SubmissionResource::class;

    // Keep the inbox record — no delete; the review is a status + notes change.
    // The one header action is the publish path: once this submission is APPROVED
    // (set the status Select to Approved and save), "Create listing" links to the
    // ProductResource create form. It never auto-creates a Product.
    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('create_listing')
                ->label('Create listing')
                ->icon('heroicon-o-rectangle-stack')
                ->color('success')
                ->visible(fn (): bool => $this->record->status === SellerSubmission::STATUS_APPROVED)
                ->url(fn (): string => SubmissionResource::productCreateUrl($this->record))
                ->openUrlInNewTab(),
        ];
    }
}
