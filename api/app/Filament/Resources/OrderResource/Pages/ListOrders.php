<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Resources\Components\Tab;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\Builder;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    // No create action — orders are created by checkout, not the admin.
    protected function getHeaderActions(): array
    {
        return [];
    }

    /**
     * The payout view (DR-8).
     *
     * "Awaiting payout" is the admin's real work queue: every PAID order whose seller has not been
     * transferred yet. Pending/failed/refunded orders never appear there, so an order that was never
     * actually paid can't be paid out by accident.
     *
     * @return array<string, Tab>
     */
    public function getTabs(): array
    {
        return [
            'all' => Tab::make('All orders'),

            'awaiting_payout' => Tab::make('Awaiting payout')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query
                    ->where('status', Order::STATUS_PAID)
                    ->where('payout_status', Order::PAYOUT_PENDING))
                ->badge(Order::query()
                    ->where('status', Order::STATUS_PAID)
                    ->where('payout_status', Order::PAYOUT_PENDING)
                    ->count() ?: null)
                ->badgeColor('warning'),

            'paid_out' => Tab::make('Paid out')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query
                    ->where('payout_status', Order::PAYOUT_PAID)),
        ];
    }
}
