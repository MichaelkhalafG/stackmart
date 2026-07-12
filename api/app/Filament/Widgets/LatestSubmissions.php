<?php

namespace App\Filament\Widgets;

use App\Models\SellerSubmission;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

/**
 * Dashboard table of the newest seller submissions needing attention — a
 * quick review queue on the landing page. Read-only surface; the full review
 * happens in SubmissionResource.
 */
class LatestSubmissions extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Latest submissions';

    public function table(Table $table): Table
    {
        return $table
            ->query(SellerSubmission::query()->latest())
            ->emptyStateIcon('heroicon-o-inbox')
            ->emptyStateHeading('No submissions yet')
            ->paginated([5, 10, 25])
            ->defaultPaginationPageOption(5)
            ->columns([
                Tables\Columns\TextColumn::make('project_name')->searchable(),
                Tables\Columns\TextColumn::make('name')->label('Seller'),
                Tables\Columns\TextColumn::make('email')->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        SellerSubmission::STATUS_APPROVED => 'success',
                        SellerSubmission::STATUS_REJECTED => 'danger',
                        SellerSubmission::STATUS_IN_REVIEW => 'info',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ]);
    }
}
