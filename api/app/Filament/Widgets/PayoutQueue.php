<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

/**
 * The payout queue — paid orders whose seller has NOT been transferred yet, oldest first.
 *
 * Settlement is manual and out of band (the admin pays, then records it via the "Mark payout paid"
 * action on the order), so the work is time-ordered: the oldest unpaid sale is the one that has kept
 * a seller waiting longest. Read-only — every row links to the order, where the action lives.
 *
 * Legacy exclusion (`seller_payout_cents > 0`): pre-migration orders defaulted to a 0 split and
 * would sit in this queue forever with nothing to pay.
 */
class PayoutQueue extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Payout queue — oldest first';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Order::query()
                    ->with('product')
                    ->where('status', Order::STATUS_PAID)
                    ->where('payout_status', Order::PAYOUT_PENDING)
                    ->where('seller_payout_cents', '>', 0)
                    // Oldest sale first: this is a work queue, not a feed.
                    ->orderBy('delivered_at')
                    ->orderBy('id')
            )
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('Order')
                    ->prefix('#')
                    ->sortable(),

                Tables\Columns\TextColumn::make('product.title')
                    ->label('Listing')
                    ->limit(30)
                    ->searchable(),

                Tables\Columns\TextColumn::make('product.seller_email')
                    ->label('Seller')
                    ->searchable()
                    // A paid order with no payee cannot be settled at all — say so rather than
                    // rendering an empty cell.
                    ->placeholder('No seller on file'),

                Tables\Columns\TextColumn::make('seller_payout_cents')
                    ->label('Owed')
                    ->money('usd', divideBy: 100)
                    ->sortable()
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('delivered_at')
                    ->label('Waiting since')
                    ->dateTime('M j, Y')
                    ->description(fn (Order $record): ?string => $record->delivered_at?->diffForHumans())
                    ->sortable(),
            ])
            ->recordUrl(fn (Order $record): string => OrderResource::getUrl('edit', ['record' => $record]))
            ->emptyStateIcon('heroicon-o-check-circle')
            ->emptyStateHeading('No payouts pending')
            ->emptyStateDescription('Every settled sale has been transferred to its seller.')
            ->paginated([5, 10, 25]);
    }
}
