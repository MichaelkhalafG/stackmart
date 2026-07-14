<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Model;

/**
 * Per-seller revenue — there is no seller account or ledger anywhere in the system (sellers are
 * denormalised onto the product as `seller_name` / `seller_email`), so this is the ONLY place the
 * money is rolled up per payee. It is derived on read, never stored.
 *
 * Grouped by `products.seller_email`, ordered by what is still owed, so the seller waiting on the
 * most money is at the top.
 *
 * Legacy exclusion (`seller_payout_cents > 0`) applies to every column here.
 */
class TopSellers extends BaseWidget
{
    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Sellers — earned vs owed';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Order::query()
                    ->join('products', 'products.id', '=', 'orders.product_id')
                    ->whereNotNull('products.seller_email')
                    ->where('orders.status', Order::STATUS_PAID)
                    ->where('orders.seller_payout_cents', '>', 0)
                    ->groupBy('products.seller_email')
                    // MIN(orders.id) gives each grouped row a stable key — Filament needs one, and a
                    // GROUP BY result has no primary key of its own.
                    ->selectRaw('MIN(orders.id) as id')
                    ->selectRaw('products.seller_email as seller_email')
                    ->selectRaw('COUNT(*) as sales_count')
                    ->selectRaw('SUM(orders.amount_cents) as gross_cents')
                    ->selectRaw('SUM(orders.seller_payout_cents) as earned_cents')
                    ->selectRaw(
                        'SUM(CASE WHEN orders.payout_status = ? THEN orders.seller_payout_cents ELSE 0 END) as owed_cents',
                        [Order::PAYOUT_PENDING]
                    )
                    ->orderByDesc('owed_cents')
                    ->orderByDesc('earned_cents')
            )
            ->columns([
                Tables\Columns\TextColumn::make('seller_email')
                    ->label('Seller')
                    ->searchable()
                    ->weight('medium'),

                Tables\Columns\TextColumn::make('sales_count')
                    ->label('Sales')
                    ->alignRight(),

                Tables\Columns\TextColumn::make('gross_cents')
                    ->label('Gross sold')
                    ->money('usd', divideBy: 100)
                    ->alignRight(),

                Tables\Columns\TextColumn::make('earned_cents')
                    ->label('Earned (after commission)')
                    ->money('usd', divideBy: 100)
                    ->alignRight(),

                Tables\Columns\TextColumn::make('owed_cents')
                    ->label('Owed now')
                    ->money('usd', divideBy: 100)
                    ->weight('bold')
                    ->color(fn ($state): string => (int) $state > 0 ? 'warning' : 'gray')
                    ->alignRight(),
            ])
            ->emptyStateIcon('heroicon-o-users')
            ->emptyStateHeading('No seller sales yet')
            ->emptyStateDescription('Sales of seller-submitted listings appear here once they are paid.')
            ->paginated([5, 10]);
    }

    /**
     * The grouped rows are not real Order records — key them by the seller they represent so
     * Filament does not collide rows or mis-target one.
     */
    public function getTableRecordKey(Model $record): string
    {
        return (string) $record->seller_email;
    }
}
