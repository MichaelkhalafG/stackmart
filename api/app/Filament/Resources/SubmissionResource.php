<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubmissionResource\Pages;
use App\Models\SellerSubmission;
use Filament\Forms;
use Filament\Forms\Form;
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

    protected static ?int $navigationSort = 4;

    protected static ?string $modelLabel = 'submission';

    protected static ?string $recordTitleAttribute = 'project_name';

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
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(self::$statuses),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Review'),
            ]);
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
