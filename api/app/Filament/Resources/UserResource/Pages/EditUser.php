<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    /**
     * Same reason as CreateUser: `is_admin` is not mass-assignable, so without this the toggle
     * would appear to save and quietly leave the flag untouched.
     */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $isAdmin = array_key_exists('is_admin', $data) ? (bool) $data['is_admin'] : null;
        unset($data['is_admin']);

        $record->update($data);

        if ($isAdmin !== null) {
            $record->forceFill(['is_admin' => $isAdmin])->save();
        }

        return $record;
    }
}
