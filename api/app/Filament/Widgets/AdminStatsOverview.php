<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\SellerSubmission;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * Dashboard stats: revenue (sum of PAID orders), order counts, and how many
 * submissions still need review. All figures derive from the frozen schema —
 * no gateway-specific fields anywhere.
 */
class AdminStatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $revenueCents = (int) Order::query()->where('status', Order::STATUS_PAID)->sum('amount_cents');
        $paidCount = Order::query()->where('status', Order::STATUS_PAID)->count();
        $totalOrders = Order::query()->count();
        $toReview = SellerSubmission::query()
            ->whereIn('status', [SellerSubmission::STATUS_NEW, SellerSubmission::STATUS_IN_REVIEW])
            ->count();

        return [
            Stat::make('Revenue (paid)', '$'.number_format($revenueCents / 100, 2))
                ->description($paidCount.' paid '.str('order')->plural($paidCount))
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),

            Stat::make('Orders', (string) $totalOrders)
                ->description($paidCount.' paid')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary'),

            Stat::make('Submissions to review', (string) $toReview)
                ->description('new + in review')
                ->descriptionIcon('heroicon-m-inbox-arrow-down')
                ->color($toReview > 0 ? 'warning' : 'gray'),
        ];
    }
}
