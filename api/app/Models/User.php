<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * `is_admin` is deliberately NOT here. It is the flag that gates the Filament panel, so one
     * careless `User::create($request->validated())` or `$user->update($request->all())` anywhere
     * in the app's future would be anonymous privilege escalation. Set it explicitly (forceFill)
     * at the two places that legitimately assign it: UserSeeder and the Filament UserResource.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Default attribute values for a NEW instance.
     *
     * `is_admin` has a database default of false, but a database default only ever touches the row —
     * `User::create()` returns the in-memory model, which never learns what the DB filled in. With
     * `is_admin` no longer mass-assignable, that left a freshly created user reporting `null` (a
     * boolean cast on a missing attribute is null, not false) until it was reloaded. Defaulting it
     * here means an unsaved User is a non-admin from the moment it exists — in memory and on disk.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_admin' => false,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Gate for the Filament admin panel. Without this, Filament falls back to
     * "any authenticated user" and a buyer who logs in at the panel gets in.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_admin;
    }

    /**
     * The orders this user has placed.
     *
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
