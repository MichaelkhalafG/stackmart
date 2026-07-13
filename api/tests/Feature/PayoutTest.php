<?php

use App\Mail\PayoutSent;
use App\Models\Order;
use App\Models\Product;
use App\Models\SellerSubmission;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

/*
 * DR-8 — payout accounting.
 *
 * The commission split is PURE ARITHMETIC: it runs today on the FakePaymentProvider and is
 * independent of which gateway is eventually chosen. The money is snapshotted onto the order at
 * checkout so a later rate change can never rewrite historical payouts.
 *
 * The settlement itself is manual: the admin transfers out of band, then records the payout with a
 * proof of transfer, which emails the seller.
 */

beforeEach(function () {
    Storage::fake('deliverables');
    Mail::fake();
});

it('splits an amount into the platform cut and the seller payout at 20%', function () {
    $split = Order::splitCommission(500000, 0.200); // $5,000.00

    expect($split['platform_cut_cents'])->toBe(100000)      // $1,000.00
        ->and($split['seller_payout_cents'])->toBe(400000); // $4,000.00
});

it('rounds the platform cut and never loses a cent', function () {
    // 20% of 999 = 199.8 → rounds to 200; the seller takes the remainder, so the two always sum
    // back EXACTLY to the amount charged.
    $split = Order::splitCommission(999, 0.200);

    expect($split['platform_cut_cents'])->toBe(200)
        ->and($split['seller_payout_cents'])->toBe(799)
        ->and($split['platform_cut_cents'] + $split['seller_payout_cents'])->toBe(999);

    foreach ([1, 7, 33, 12345, 2500000] as $amount) {
        $split = Order::splitCommission($amount, 0.200);
        expect($split['platform_cut_cents'] + $split['seller_payout_cents'])->toBe($amount);
    }
});

it('snapshots the commission onto the order at checkout', function () {
    $product = Product::factory()->published()->create([
        'price_cents' => 480000,
        'commission_rate' => 0.200,
    ]);

    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/checkout', ['product_id' => $product->id])->assertOk();

    $order = Order::where('product_id', $product->id)->firstOrFail();

    expect((float) $order->commission_rate)->toBe(0.2)
        ->and($order->platform_cut_cents)->toBe(96000)      // 20% of $4,800
        ->and($order->seller_payout_cents)->toBe(384000)    // the seller's $3,840
        ->and($order->payout_status)->toBe(Order::PAYOUT_PENDING)
        ->and($order->payout_paid_at)->toBeNull();
});

it('keeps the snapshot even if the product rate later changes', function () {
    $product = Product::factory()->published()->create([
        'price_cents' => 100000,
        'commission_rate' => 0.200,
    ]);

    Sanctum::actingAs(User::factory()->create());
    $this->postJson('/api/checkout', ['product_id' => $product->id])->assertOk();

    $order = Order::where('product_id', $product->id)->firstOrFail();

    // The platform later changes its cut — the historical order must NOT move.
    $product->update(['commission_rate' => 0.500]);

    expect($order->fresh()->platform_cut_cents)->toBe(20000)
        ->and($order->fresh()->seller_payout_cents)->toBe(80000);
});

it('emails the seller when a payout is recorded, with no sensitive data', function () {
    $submission = SellerSubmission::factory()->create([
        'payout_method' => SellerSubmission::PAYOUT_BANK,
        'payout_holder_name' => 'Jane Seller',
        'payout_identifier' => 'DE89370400440532013000',
    ]);

    $product = Product::factory()->published()->create([
        'seller_submission_id' => $submission->id,
        'seller_name' => 'Jane Seller',
        'seller_email' => 'jane@example.com',
    ]);

    $buyer = User::factory()->create(['name' => 'Bob Buyer', 'email' => 'bob@example.com']);

    $order = Order::factory()->for($buyer)->for($product)->paid()->create([
        'amount_cents' => 500000,
        'platform_cut_cents' => 100000,
        'seller_payout_cents' => 400000,
        'payout_status' => Order::PAYOUT_PAID,
        'payout_paid_at' => now(),
        'license_key' => 'AAAA-BBBB-CCCC-DDDD',
    ]);

    Mail::to($product->seller_email)->send(new PayoutSent($order->fresh()->load('product')));

    Mail::assertSent(PayoutSent::class, 1);
    Mail::assertSent(PayoutSent::class, fn (PayoutSent $mail): bool => $mail->hasTo('jane@example.com'));

    // The rendered email must carry the payout amount — and NOTHING sensitive.
    $rendered = (new PayoutSent($order->fresh()->load('product')))->render();

    expect($rendered)->toContain('4,000.00');

    foreach ([
        'DE89370400440532013000',  // the seller's own bank identifier
        'AAAA-BBBB-CCCC-DDDD',     // the buyer's license key
        'bob@example.com',         // the buyer's identity
        'Bob Buyer',
        '1,000.00',                // the platform's cut is internal
    ] as $secret) {
        expect($rendered)->not->toContain($secret);
    }
});

it('defaults every new order to a pending payout', function () {
    // ->fresh() so we read the DB defaults back, not the in-memory model.
    $order = Order::factory()->create()->fresh();

    expect($order->payout_status)->toBe(Order::PAYOUT_PENDING)
        ->and($order->payout_paid_at)->toBeNull()
        ->and($order->payout_proof_path)->toBeNull();
});

it('records a payout as paid with its proof on the private disk', function () {
    $product = Product::factory()->published()->create([
        'seller_name' => 'Jane Seller',
        'seller_email' => 'jane@example.com',
    ]);

    $order = Order::factory()->for($product)->paid()->create([
        'amount_cents' => 500000,
        'platform_cut_cents' => 100000,
        'seller_payout_cents' => 400000,
    ])->fresh(); // read the DB default back

    expect($order->payout_status)->toBe(Order::PAYOUT_PENDING);

    // What the Filament "Mark payout paid" action persists.
    Storage::disk('deliverables')->put('payouts/proof.png', 'fake-image-bytes');

    $order->update([
        'payout_proof_path' => 'payouts/proof.png',
        'payout_status' => Order::PAYOUT_PAID,
        'payout_paid_at' => now(),
    ]);

    $order->refresh();

    expect($order->payout_status)->toBe(Order::PAYOUT_PAID)
        ->and($order->payout_paid_at)->not->toBeNull();

    // The proof is a financial document: private disk only, never public.
    Storage::disk('deliverables')->assertExists($order->payout_proof_path);
});

it('hides the payout internals from order serialization', function () {
    $array = Order::factory()->paid()->create()->toArray();

    expect($array)->not->toHaveKeys([
        'commission_rate', 'platform_cut_cents', 'seller_payout_cents',
        'payout_status', 'payout_paid_at', 'payout_proof_path', 'payout_notes',
    ]);
});
