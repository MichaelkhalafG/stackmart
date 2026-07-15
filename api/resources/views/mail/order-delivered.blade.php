@component('mail::message')
# Your purchase is ready

Thanks for your purchase on {{ config('app.name') }} — your product is ready to download.

- **Product:** {{ $order->product->title }}
- **Order:** #{{ $order->id }}
- **Amount:** ${{ number_format($order->amount_cents / 100, 2) }} {{ $order->currency }}

**Your license key**

@component('mail::panel')
{{ $order->license_key }}
@endcomponent

**Keep this key — you need it to download.** Your download is license-gated: you'll be asked to sign
in and enter the key above before the source-code ZIP is released. It is also your proof that your
copy is a paid one.

@component('mail::button', ['url' => $downloadUrl])
Download your product
@endcomponent

Your license key and download stay available on your purchases page:

@component('mail::button', ['url' => $purchasesUrl, 'color' => 'success'])
Go to your purchases
@endcomponent

If the key doesn't work, make sure you're signed in as the account that made the purchase.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
