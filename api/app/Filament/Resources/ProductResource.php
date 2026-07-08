<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Basics')
                    ->description('Core listing details.')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function (string $operation, $state, Forms\Set $set) {
                                // Auto-fill slug from the title only while creating; editable afterwards.
                                if ($operation === 'create') {
                                    $set('slug', Str::slug($state));
                                }
                            }),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('Public URL identifier. Auto-filled from the title; editable.'),
                        Forms\Components\TextInput::make('tagline')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),
                        Forms\Components\Select::make('category_id')
                            ->relationship('category', 'name')
                            ->required()
                            ->searchable()
                            ->preload(),
                        Forms\Components\TextInput::make('price_cents')
                            ->label('Price (cents)')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->prefix('¢')
                            ->helperText('Stored in integer cents — e.g. 480000 = $4,800.00.'),
                        Forms\Components\TextInput::make('currency')
                            ->required()
                            ->default('USD')
                            ->maxLength(3),
                        Forms\Components\Select::make('status')
                            ->required()
                            ->default(Product::STATUS_DRAFT)
                            ->options([
                                Product::STATUS_DRAFT => 'Draft',
                                Product::STATUS_PUBLISHED => 'Published',
                                Product::STATUS_SOLD => 'Sold',
                            ]),
                        Forms\Components\Toggle::make('is_featured')
                            ->helperText('Surface on the home featured strip.'),
                        Forms\Components\DateTimePicker::make('published_at')
                            ->helperText('Set when the listing goes live.'),
                    ]),

                Forms\Components\Section::make('Details')
                    ->description('Long-form content and lists.')
                    ->schema([
                        Forms\Components\RichEditor::make('description')
                            ->required()
                            ->columnSpanFull(),
                        Forms\Components\TagsInput::make('tech_stack')
                            ->placeholder('Laravel, Next.js, MySQL…')
                            ->helperText('Press Enter after each technology.')
                            ->columnSpanFull(),
                        Forms\Components\TagsInput::make('included')
                            ->label("What's included")
                            ->placeholder('Full source code, Deployment guide…')
                            ->columnSpanFull(),
                        Forms\Components\Repeater::make('faq')
                            ->label('FAQ')
                            ->schema([
                                Forms\Components\TextInput::make('q')->label('Question')->required(),
                                Forms\Components\Textarea::make('a')->label('Answer')->required(),
                            ])
                            ->addActionLabel('Add question')
                            ->reorderable()
                            ->collapsible()
                            ->defaultItems(0)
                            // Persist NULL (not []) when there are no FAQ entries.
                            ->dehydrateStateUsing(fn (?array $state): ?array => empty($state) ? null : array_values($state))
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Metrics')
                    ->description('The metrics JSON blob surfaced on the listing page.')
                    ->schema([
                        Forms\Components\KeyValue::make('metrics')
                            ->keyLabel('Metric')
                            ->valueLabel('Value')
                            ->helperText('Expected keys: mrr, users, founded, profit.')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Media & Links')
                    ->description('Gallery images (public) and optional external links.')
                    ->schema([
                        Forms\Components\FileUpload::make('images')
                            ->multiple()
                            ->image()
                            ->reorderable()
                            ->appendFiles()
                            ->disk('public')
                            ->directory('products')
                            ->helperText('Public gallery images, stored as a JSON array of paths.')
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('demo_url')
                            ->label('Demo URL')
                            ->url()
                            ->rules(['nullable', 'url:https'])
                            ->maxLength(255)
                            ->dehydrateStateUsing(fn (?string $state): ?string => filled($state) ? trim($state) : null)
                            ->helperText('Optional HTTPS URL. Clearing it removes the public "Live Demo" button.'),
                        Forms\Components\TextInput::make('repository_url')
                            ->label('Repository URL')
                            ->url()
                            ->rules(['nullable', 'url:https'])
                            ->maxLength(255)
                            ->dehydrateStateUsing(fn (?string $state): ?string => filled($state) ? trim($state) : null)
                            ->helperText('Optional HTTPS URL (github/gitlab/bitbucket/self-hosted). Clearing removes the button.'),
                    ]),

                Forms\Components\Section::make('Delivery')
                    ->description('The purchased deliverable — private, never web-accessible.')
                    ->schema([
                        Forms\Components\FileUpload::make('deliverable_path')
                            ->label('Deliverable ZIP')
                            ->disk('deliverables')
                            ->visibility('private')
                            ->acceptedFileTypes(['application/zip', 'application/x-zip-compressed', 'application/octet-stream'])
                            ->downloadable()
                            ->helperText('Stored on the private disk; streamed only through the authenticated download endpoint after purchase.'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Category')
                    ->sortable(),
                Tables\Columns\TextColumn::make('price_cents')
                    ->label('Price')
                    ->money('USD', divideBy: 100)
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        Product::STATUS_PUBLISHED => 'success',
                        Product::STATUS_SOLD => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\IconColumn::make('is_featured')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('published_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        Product::STATUS_DRAFT => 'Draft',
                        Product::STATUS_PUBLISHED => 'Published',
                        Product::STATUS_SOLD => 'Sold',
                    ]),
                Tables\Filters\SelectFilter::make('category')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
