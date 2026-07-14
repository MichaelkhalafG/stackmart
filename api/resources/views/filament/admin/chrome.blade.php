{{--
    Panel chrome (STACKMART identity): navy top strip.

    Filament renders the brand in .fi-sidebar-header and the user menu in .fi-topbar —
    two separate white h-16 bars sitting side by side. Both are painted navy here so the
    white MDN mark has contrast and the top of the panel reads as one continuous bar.

    Tailwind utilities (bg-white / dark:bg-gray-900) sit on the same elements, and the
    dark: variants out-specify a plain class selector, so these overrides are !important
    by necessity rather than by habit. Presentation only.
--}}
<style>
    :root {
        --sm-navy: #032B42;
        --sm-navy-deep: #021D2E;
        --sm-lavender: #DEE0FF;
    }

    /* The two halves of the top strip. */
    .fi-sidebar-header,
    .fi-topbar > nav {
        background-color: var(--sm-navy) !important;
        --tw-ring-color: rgba(222, 224, 255, 0.10) !important;
        box-shadow: none !important;
    }

    /* Brand lockup: white mark + wordmark. */
    .sm-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.625rem;
    }

    .sm-brand-mark {
        height: 2rem;
        width: auto;
        display: block;
    }

    .sm-brand-wordmark {
        color: #FFFFFF;
        font-weight: 700;
        font-size: 1.0625rem;
        letter-spacing: 0.06em;
        line-height: 1;
    }

    /* Topbar sits on navy now — its icons/text were tuned for a white bar. */
    .fi-topbar > nav .fi-icon-btn,
    .fi-topbar > nav .fi-icon-btn-icon,
    .fi-topbar > nav .fi-breadcrumbs,
    .fi-topbar > nav .fi-breadcrumbs a,
    .fi-topbar > nav .fi-breadcrumbs-item-label,
    .fi-topbar > nav .fi-dropdown-trigger button,
    .fi-topbar > nav .fi-topbar-item-label {
        color: var(--sm-lavender) !important;
    }

    .fi-topbar > nav .fi-icon-btn:hover,
    .fi-topbar > nav .fi-breadcrumbs a:hover {
        color: #FFFFFF !important;
    }

    /* The user-menu avatar ring reads as a smudge against navy — soften it. */
    .fi-topbar > nav .fi-user-avatar {
        --tw-ring-color: rgba(222, 224, 255, 0.25) !important;
    }
</style>
