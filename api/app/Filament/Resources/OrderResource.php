<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * ADMIN Filament resource for orders. Read-mostly: the only mutable
 * control is the status Select. A "manual refund" is simply setting status to
 * `refunded` and saving — no payment/refund integration, no gateway call.
 *
 * NOT the API `OrderResource` under app/Http/Resources.
 */
class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?int $navigationSort = 3;

    protected static ?string $recordTitleAttribute = 'provider_reference';

    /** @var array<string, string> */
    protected static array $statuses = [
        Order::STATUS_PENDING => 'Pending',
        Order::STATUS_PAID => 'Paid',
        Order::STATUS_FAILED => 'Failed',
        Order::STATUS_REFUNDED => 'Refunded',
    ];

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Order')
                    ->columns(2)
                    ->schema([
                        // The one mutable control — admin sets the lifecycle status.
                        // Changing to `refunded` here IS the manual refund path.
                        Forms\Components\Select::make('status')
                            ->options(self::$statuses)
                            ->required()
                            ->native(false)
                            ->helperText('Set to "Refunded" to manually mark a refund — no gateway call is made.'),

                        Forms\Components\TextInput::make('amount_cents')
                            ->label('Amount')
                            ->disabled()
                            ->formatStateUsing(fn (?int $state): ?string => $state === null ? null : '$'.number_format($state / 100, 2)),

                        Forms\Components\TextInput::make('user.name')->label('Buyer')->disabled(),
                        Forms\Components\TextInput::make('product.title')->label('Product')->disabled(),

                        Forms\Components\TextInput::make('provider_reference')->disabled(),
                        Forms\Components\TextInput::make('provider_payment_id')->label('Provider payment id')->disabled(),
                    ]),

                Forms\Components\Section::make('Fulfillment')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('license_key')->disabled(),
                        Forms\Components\TextInput::make('download_count')->disabled(),
                        Forms\Components\DateTimePicker::make('delivered_at')->disabled(),
                        Forms\Components\TextInput::make('currency')->disabled(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('user.name')->label('Buyer')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('product.title')->label('Product')->searchable()->limit(30),
                Tables\Columns\TextColumn::make('amount_cents')->label('Amount')->money('USD', divideBy: 100)->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        Order::STATUS_PAID => 'success',
                        Order::STATUS_FAILED => 'danger',
                        Order::STATUS_REFUNDED => 'warning',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('provider_reference')->searchable()->limit(24)->toggleable(),
                Tables\Columns\TextColumn::make('download_count')->numeric()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('delivered_at')->dateTime()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(self::$statuses),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        // No create page — orders originate from checkout, never the admin.
        return [
            'index' => Pages\ListOrders::route('/'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
