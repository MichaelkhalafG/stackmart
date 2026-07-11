<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

// DatabaseTruncation (not RefreshDatabase): it COMMITS inserted rows and truncates between
// tests, so InnoDB/MariaDB FULLTEXT (MATCH…AGAINST) can see the rows. RefreshDatabase wraps
// each test in a transaction, and FULLTEXT cannot search uncommitted rows.
pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\DatabaseTruncation::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Whether S3.01 auth endpoints are registered on the current branch.
 *
 * The auth-flow tests are written to the FROZEN §Auth contract but the endpoints
 * live on `day-3` (routes/auth.php is empty on `day-3`). Each auth
 * test is guarded with `->skip(fn () => ! authEndpointsAvailable(), …)` so the
 * suite is green here now and the auth tests light up automatically once S3.01 is
 * merged at end-of-day integration (roadmap dependency J3.03 dep S3.01).
 */
function authEndpointsAvailable(): bool
{
    foreach (app('router')->getRoutes()->getRoutes() as $route) {
        if ($route->uri() === 'api/auth/login' && in_array('POST', $route->methods(), true)) {
            return true;
        }
    }

    return false;
}
