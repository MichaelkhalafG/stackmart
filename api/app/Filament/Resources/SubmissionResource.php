<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubmissionResource\Pages;
use App\Models\SellerSubmission;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * Filament resource for the seller-submission inbox. This IS the whole
 * "seller" side — a review queue, not a seller account. The admin moves a
 * submission new → in_review → approved | rejected and records `admin_notes`.
 */
class SubmissionResource extends Resource
{
    protected static ?string $model = SellerSubmission::class;

    protected static ?string $navigationIcon = 'heroicon-o-inbox-arrow-down';

    protected static ?string $navigationGroup = 'Submissions';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'submission';

    protected static ?string $recordTitleAttribute = 'project_name';

    /**
     * A nav badge with the count of submissions still awaiting review (new + in_review) —
     * the admin sees the queue depth at a glance without opening the resource.
     */
    public static function getNavigationBadge(): ?string
    {
        $pending = static::getModel()::whereIn('status', [
            SellerSubmission::STATUS_NEW,
            SellerSubmission::STATUS_IN_REVIEW,
        ])->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Submissions awaiting review';
    }

    /** @var array<string, string> */
    protected static array $statuses = [
        SellerSubmission::STATUS_NEW => 'New',
        SellerSubmission::STATUS_IN_REVIEW => 'In review',
        SellerSubmission::STATUS_APPROVED => 'Approved',
        SellerSubmission::STATUS_REJECTED => 'Rejected',
    ];

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Submission')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('project_name')->disabled(),
                        Forms\Components\TextInput::make('url')->label('Project URL')->disabled(),
                        Forms\Components\TextInput::make('name')->label('Seller name')->disabled(),
                        Forms\Components\TextInput::make('email')->disabled(),
                        Forms\Components\TextInput::make('asking_price_cents')
                            ->label('Asking price')
                            ->disabled()
                            ->formatStateUsing(fn (?int $state): ?string => $state === null ? null : '$'.number_format($state / 100, 2)),
                        Forms\Components\TextInput::make('mrr_cents')
                            ->label('MRR')
                            ->disabled()
                            ->formatStateUsing(fn (?int $state): ?string => $state === null ? null : '$'.number_format($state / 100, 2)),
                        Forms\Components\Textarea::make('description')->disabled()->columnSpanFull()->rows(4),
                    ]),

                Forms\Components\Section::make('Review')
                    ->columns(1)
                    ->schema([
                        // The review workflow: new → in_review → approved | rejected.
                        Forms\Components\Select::make('status')
                            ->options(self::$statuses)
                            ->required()
                            ->native(false),
                        Forms\Components\Textarea::make('admin_notes')
                            ->label('Admin notes')
                            ->rows(4)
                            ->helperText('Internal notes on this submission — not shown to the seller.'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('project_name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('name')->label('Seller')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable()->toggleable(),
                Tables\Columns\TextColumn::make('asking_price_cents')->label('Asking')->money('USD', divideBy: 100)->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        SellerSubmission::STATUS_APPROVED => 'success',
                        SellerSubmission::STATUS_REJECTED => 'danger',
                        SellerSubmission::STATUS_IN_REVIEW => 'info',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateIcon('heroicon-o-inbox-arrow-down')
            ->emptyStateHeading('No submissions yet')
            ->emptyStateDescription('Seller submissions from the public /sell form land here for review.')
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(self::$statuses),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Review'),

                // One-click status transitions (the status Select on the form does the
                // same; these are the quick-queue affordances). new → in_review → approved | rejected.
                Tables\Actions\Action::make('start_review')
                    ->label('Start review')
                    ->icon('heroicon-o-play')
                    ->color('info')
                    ->visible(fn (SellerSubmission $record): bool => $record->status === SellerSubmission::STATUS_NEW)
                    ->action(fn (SellerSubmission $record) => self::transition($record, SellerSubmission::STATUS_IN_REVIEW)),

                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (SellerSubmission $record): bool => in_array($record->status, [SellerSubmission::STATUS_NEW, SellerSubmission::STATUS_IN_REVIEW], true))
                    ->action(fn (SellerSubmission $record) => self::transition($record, SellerSubmission::STATUS_APPROVED)),

                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (SellerSubmission $record): bool => in_array($record->status, [SellerSubmission::STATUS_NEW, SellerSubmission::STATUS_IN_REVIEW], true))
                    ->action(fn (SellerSubmission $record) => self::transition($record, SellerSubmission::STATUS_REJECTED)),

                // Publish path: only on APPROVED rows. Links to the ProductResource create
                // form to START a listing — the Product row is created MANUALLY there. We
                // never auto-create a product and never add a table.
                Tables\Actions\Action::make('create_listing')
                    ->label('Create listing')
                    ->icon('heroicon-o-rectangle-stack')
                    ->color('success')
                    ->visible(fn (SellerSubmission $record): bool => $record->status === SellerSubmission::STATUS_APPROVED)
                    ->url(fn (SellerSubmission $record): string => self::productCreateUrl($record))
                    ->openUrlInNewTab(),
            ]);
    }

    /**
     * Apply a review-status transition and notify the admin. Pure status change —
     * no side effects on products (publishing is a separate, manual step).
     */
    protected static function transition(SellerSubmission $record, string $status): void
    {
        $record->update(['status' => $status]);

        Notification::make()
            ->title('Submission marked "'.(self::$statuses[$status] ?? $status).'"')
            ->success()
            ->send();
    }

    /**
     * The publish path — a link to the ProductResource CREATE form that starts a
     * listing from an approved submission. It NEVER creates a Product itself (that
     * stays a manual admin step) and adds no table. The submission's details ride
     * along as query params (title/links + a provenance `submission` id) so the
     * create form can be pre-filled by a future Product-side wiring; today it is a
     * one-click jump into the create screen. Non-null params only.
     */
    public static function productCreateUrl(SellerSubmission $record): string
    {
        return ProductResource::getUrl('create', array_filter([
            'title' => $record->project_name,
            'demo_url' => $record->url,
            'submission' => $record->id,
        ], fn ($value): bool => $value !== null && $value !== ''));
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        // No create — submissions arrive from the public sell form (POST /submissions, J3).
        return [
            'index' => Pages\ListSubmissions::route('/'),
            'edit' => Pages\EditSubmission::route('/{record}/edit'),
        ];
    }
}
