<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use Filament\Resources\Pages\EditRecord;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    // No delete — orders are financial records; the only mutation is a status change.
    protected function getHeaderActions(): array
    {
        return [];
    }
}
