<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use Filament\Resources\Pages\ListRecords;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    // No create action — orders are created by checkout, not the admin.
    protected function getHeaderActions(): array
    {
        return [];
    }
}
