<?php

use Illuminate\Support\Facades\Validator;

/*
 * The `nullable|url:https` rule that guards demo_url / repository_url
 * (12_API_Specification.md; used by the Filament ProductResource and the
 * forthcoming POST /submissions request, J3). No HTTP endpoint currently
 * carries it, so the rule itself is asserted directly here; the full 422
 * HTTP-shape assertion attaches to the submissions endpoint in J3.
 *
 * Note on "empty": the HTTP layer's ConvertEmptyStringsToNull turns '' into
 * null before validation, so an empty input is accepted as null. We assert the
 * null and omitted cases (what '' becomes), not a raw '' the middleware never runs on.
 */

$rule = ['url' => 'nullable|url:https'];

it('rejects non-HTTPS / non-URL values', function (string $url) use ($rule) {
    expect(Validator::make(['url' => $url], $rule)->fails())->toBeTrue();
})->with([
    'http'       => ['http://example.com'],
    'ftp'        => ['ftp://example.com'],
    'ssh/git'    => ['git@github.com:acme/repo.git'],
    'javascript' => ['javascript:alert(1)'],
    'garbage'    => ['not-a-url'],
]);

it('accepts HTTPS urls and null', function (?string $url) use ($rule) {
    expect(Validator::make(['url' => $url], $rule)->fails())->toBeFalse();
})->with([
    'https'         => ['https://example.com'],
    'https w/ path' => ['https://demo.acme.io/path?ref=1'],
    'null'          => [null],
]);

it('accepts an omitted url (nullable, field absent)', function () use ($rule) {
    expect(Validator::make([], $rule)->fails())->toBeFalse();
});
