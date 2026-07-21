<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Users.
 *
 * The comment here used to say the known dev credentials were "never used in production" — but
 * `db:seed --force` is a documented production deploy step, so they WERE about to be. A published
 * repo plus admin@stackmart.test / "password" plus an admin panel on the API root is a complete
 * break-in, so the demo logins are now fenced to local/testing.
 *
 * Anywhere else, an admin is created ONLY from ADMIN_EMAIL + ADMIN_PASSWORD, and if either is
 * missing the seeder creates nothing and says so. There is deliberately no fallback password: a
 * default that ships in the repo is the thing being fixed.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('local', 'testing')) {
            $this->seedDemoAccounts();

            return;
        }

        $this->seedProductionAdmin();
    }

    /** The throwaway logins the dev/test flows and OrderSeeder depend on. Never outside local/testing. */
    private function seedDemoAccounts(): void
    {
        $this->makeUser('admin@stackmart.test', 'STACKMART Admin', 'password', isAdmin: true);
        $this->makeUser('buyer@stackmart.test', 'Sample Buyer', 'password', isAdmin: false);
    }

    /** Real deployments: env-supplied credentials or nothing at all. */
    private function seedProductionAdmin(): void
    {
        $email = (string) env('ADMIN_EMAIL', '');
        $password = (string) env('ADMIN_PASSWORD', '');

        if ($email === '' || $password === '') {
            $this->command?->warn(
                'UserSeeder: no admin created — set ADMIN_EMAIL and ADMIN_PASSWORD, then re-run '
                .'`php artisan db:seed --class=UserSeeder --force`.'
            );

            return;
        }

        $this->makeUser($email, (string) env('ADMIN_NAME', 'STACKMART Admin'), $password, isAdmin: true);

        $this->command?->info("UserSeeder: admin account ready for {$email}.");
    }

    /**
     * `is_admin` is NOT mass-assignable (see User::$fillable), so the flag is set explicitly after
     * the row exists rather than passed through updateOrCreate.
     */
    private function makeUser(string $email, string $name, string $password, bool $isAdmin): void
    {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        $user->forceFill(['is_admin' => $isAdmin])->save();
    }
}
