<?php

namespace App\Filament\Resources\SubmissionResource\Pages;

use App\Filament\Resources\SubmissionResource;
use Filament\Resources\Pages\EditRecord;

class EditSubmission extends EditRecord
{
    protected static string $resource = SubmissionResource::class;

    // Keep the inbox record — no delete; the review is a status + notes change.
    protected function getHeaderActions(): array
    {
        return [];
    }
}
