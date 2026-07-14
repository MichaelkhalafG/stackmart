{{--
    Panel brand: the MDN mark + the STACKMART wordmark.

    Rendered in two places (chrome.blade.php controls which is visible when):
      - context 'sidebar' (default) — Filament's h-16 sidebar header, desktop.
      - context 'topbar'            — the mobile topbar, since the sidebar (and
                                      therefore its header) is off-canvas on phones.

    Both marks ship in the markup and are toggled on the .dark class in CSS, so a
    per-mode swap needs no JS and survives the server-rendered first paint.
--}}
@php($context = $context ?? 'sidebar')

<span class="sm-brand sm-brand--{{ $context }}">
    {{-- Light chrome shows the navy mark, dark chrome the white one. Whichever is
         hidden is display:none, so it is not announced — both carry the alt text and
         the brand keeps an accessible name in either mode (the wordmark is suppressed
         on the mobile topbar, so the mark has to supply it there). --}}
    <img
        src="{{ asset('images/mdn-logo-navy.png') }}"
        alt="STACKMART"
        class="sm-brand-mark sm-brand-mark--navy"
    />
    <img
        src="{{ asset('images/mdn-logo-white.png') }}"
        alt="STACKMART"
        class="sm-brand-mark sm-brand-mark--white"
    />
    <span class="sm-brand-wordmark">STACKMART</span>
</span>
