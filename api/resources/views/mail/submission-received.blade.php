@component('mail::message')
# New seller submission

A new project has been submitted for review.

- **Project:** {{ $submission->project_name }}
- **Seller:** {{ $submission->name }} ({{ $submission->email }})
- **Asking price:** ${{ number_format($submission->asking_price_cents / 100, 2) }}
- **MRR:** ${{ number_format($submission->mrr_cents / 100, 2) }}
@if ($submission->url)
- **Link:** {{ $submission->url }}
@endif

**Description**

{{ $submission->description }}

@component('mail::button', ['url' => config('app.url').'/admin'])
Review in admin
@endcomponent

Status: **{{ $submission->status }}**

Thanks,<br>
{{ config('app.name') }}
@endcomponent
