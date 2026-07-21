<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    /**
     * `is_admin` is not mass-assignable (User::$fillable), so Filament's default
     * `Model::create($data)` would silently drop the Administrator toggle. Set it explicitly —
     * an admin ticking that box in the panel is the one legitimate way the flag gets set.
     */
    protected function handleRecordCreation(array $data): Model
    {
        $isAdmin = (bool) ($data['is_admin'] ?? false);
        unset($data['is_admin']);

        $user = static::getModel()::create($data);
        $user->forceFill(['is_admin' => $isAdmin])->save();

        return $user;
    }
}
