{{--
    Decorative backdrop for the admin login screen (STACKMART identity).
    Injected via a BODY_START render hook scoped to Filament\Pages\Auth\Login,
    so Filament's own login card/form markup stays stock and upgrade-safe.
    Everything here is presentation only — pointer-events: none throughout.
--}}
<link rel="stylesheet" href="https://fonts.bunny.net/css?family=ibm-plex-mono:400" />

<style>
    :root {
        --sm-navy-deep: #021D2E;
        --sm-navy: #032B42;
        --sm-royal: #010ED0;
        --sm-lavender: #DEE0FF;
    }

    /* Paint the auth layout itself — the card is a child and keeps its own surface. */
    .fi-simple-layout {
        background-color: var(--sm-navy-deep);
        position: relative;
        isolation: isolate;
    }

    /* Layer 1: royal-blue radial mesh for depth, over deep navy. */
    .fi-simple-layout::before {
        content: '';
        position: fixed;
        inset: 0;
        z-index: -2;
        pointer-events: none;
        background:
            radial-gradient(60rem 40rem at 15% 12%, color-mix(in srgb, var(--sm-royal) 26%, transparent), transparent 62%),
            radial-gradient(48rem 34rem at 88% 82%, color-mix(in srgb, var(--sm-navy) 85%, transparent), transparent 60%),
            var(--sm-navy-deep);
    }

    /* Layer 2: faint 36px grid. Kept very low opacity — the identity says never busy. */
    .fi-simple-layout::after {
        content: '';
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background-image:
            linear-gradient(to right, rgba(222, 224, 255, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(222, 224, 255, 0.045) 1px, transparent 1px);
        background-size: 36px 36px;
        /* Fade the grid out behind the card so it never competes with the form. */
        mask-image: radial-gradient(70% 60% at 50% 50%, transparent 30%, #000 78%);
        -webkit-mask-image: radial-gradient(70% 60% at 50% 50%, transparent 30%, #000 78%);
    }

    /* Keep the stock card (and everything else) above the decoration. */
    .fi-simple-layout > * {
        position: relative;
        z-index: 1;
    }

    /* Terminal motif, tucked into a corner. */
    .sm-terminal-motif {
        position: fixed;
        left: 1.75rem;
        bottom: 1.5rem;
        z-index: 0;
        pointer-events: none;
        user-select: none;
        font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.8125rem;
        line-height: 1;
        letter-spacing: 0.02em;
        color: var(--sm-lavender);
        opacity: 0.38;
    }

    .sm-terminal-motif .sm-prompt {
        opacity: 0.6;
    }

    .sm-terminal-motif .sm-cursor {
        display: inline-block;
        width: 0.5rem;
        height: 0.95em;
        margin-inline-start: 0.35rem;
        vertical-align: text-bottom;
        background-color: var(--sm-lavender);
        border-radius: 1px;
        animation: sm-blink 1.15s steps(1, end) infinite;
    }

    @keyframes sm-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
        .sm-terminal-motif .sm-cursor {
            animation: none;
            opacity: 0.7;
        }
    }

    /* Small screens: the card owns the viewport — drop the motif rather than crowd it. */
    @media (max-width: 40rem) {
        .sm-terminal-motif { display: none; }
    }
</style>

<div class="sm-terminal-motif" aria-hidden="true">
    <span class="sm-prompt">$</span> deploy --stack<span class="sm-cursor"></span>
</div>
