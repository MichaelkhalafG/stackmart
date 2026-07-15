<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\SellerSubmission;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * Dashboard stats for the commission/payout system (DR-8).
 *
 * The money is READ here, never recomputed: `platform_cut_cents` and `seller_payout_cents` are
 * snapshotted onto each order at checkout, so these are plain sums over frozen columns.
 *
 * LEGACY EXCLUSION — every money aggregate is filtered on `seller_payout_cents > 0`. Orders created
 * before the payout migration took `0` from the column defaults and were never backfilled; counting
 * them would silently under-report the platform cut and the amount owed to sellers.
 *
 * All sums are integer cents; the division by 100 happens only at display.
 */
class AdminStatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        // Paid orders that carry a real (post-migration) commission split.
        $settledSales = Order::query()
            ->where('status', Order::STATUS_PAID)
            ->where('seller_payout_cents', '>', 0);

        $gmvCents = (int) (clone $settledSales)->sum('amount_cents');
        $platformCents = (int) (clone $settledSales)->sum('platform_cut_cents');
        $paidCount = (clone $settledSales)->count();

        // Owed to sellers right now — the admin transfers this out of band.
        $pending = (clone $settledSales)->where('payout_status', Order::PAYOUT_PENDING);
        $pendingCents = (int) (clone $pending)->sum('seller_payout_cents');
        $pendingCount = (clone $pending)->count();

        // Already transferred (proof stored on the private disk).
        $settled = Order::query()
            ->where('payout_status', Order::PAYOUT_PAID)
            ->where('seller_payout_cents', '>', 0);
        $settledCents = (int) (clone $settled)->sum('seller_payout_cents');
        $settledCount = (clone $settled)->count();

        // Paid orders with no payee on the listing (admin-authored or seeded). These can never be
        // paid out — FulfillOrder and recordPayout both skip them silently, so surface the count.
        $blockedCount = Order::query()
            ->where('status', Order::STATUS_PAID)
            ->whereDoesntHave('product', fn ($q) => $q->whereNotNull('seller_email'))
            ->count();

        $toReview = SellerSubmission::query()
            ->whereIn('status', [SellerSubmission::STATUS_NEW, SellerSubmission::STATUS_IN_REVIEW])
            ->count();

        return [
            // A — the old single "Revenue" stat summed gross sales and read as if it were ours.
            Stat::make('GMV (gross sales)', self::money($gmvCents))
                ->description($paidCount.' paid '.str('order')->plural($paidCount).' — buyers paid this')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('gray'),

            Stat::make('Platform revenue', self::money($platformCents))
                ->description('commission STACKMART keeps')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),

            // B
            Stat::make('Pending payouts', self::money($pendingCents))
                ->description($pendingCount.' '.str('seller')->plural($pendingCount).' awaiting transfer')
                ->descriptionIcon('heroicon-m-clock')
                ->color($pendingCents > 0 ? 'warning' : 'gray'),

            // C
            Stat::make('Payouts settled', self::money($settledCents))
                ->description($settledCount.' transferred')
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success'),

            // D
            Stat::make('Blocked payouts', (string) $blockedCount)
                ->description('paid orders with no seller on file')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($blockedCount > 0 ? 'danger' : 'gray'),

            Stat::make('Submissions to review', (string) $toReview)
                ->description('new + in review')
                ->descriptionIcon('heroicon-m-inbox-arrow-down')
                ->color($toReview > 0 ? 'warning' : 'gray'),
        ];
    }

    /** Cents in, display string out — the only place money is divided by 100. */
    protected static function money(int $cents): string
    {
        return '$'.number_format($cents / 100, 2);
    }
}
