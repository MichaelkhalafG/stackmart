<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * One admin (gates Filament /admin) and one buyer. Known dev credentials — never used in production.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@stackmart.test'],
            [
                'name' => 'STACKMART Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'buyer@stackmart.test'],
            [
                'name' => 'Sample Buyer',
                'password' => Hash::make('password'),
                'is_admin' => false,
                'email_verified_at' => now(),
            ]
        );
    }
}
