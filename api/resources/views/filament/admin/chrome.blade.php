{{--
    STACKMART admin theme — ONE token set, flipped by .dark.

    Injected panel-wide via a BODY_START render hook (AdminPanelProvider).

    Strategy: rather than hand-styling components, this overrides Filament's own
    design-system ramps (--gray-*, --primary-*, --danger-*) with navy/royal families.
    Filament's utilities (bg-gray-50 canvas, dark:bg-gray-900 cards, primary buttons,
    focus rings, links, selected rows, badges) then inherit the palette for free, so
    the panel reads as one designed system instead of defaults with a colour swapped.
    Only the chrome (topbar/sidebar/brand), which Filament hardcodes to white, needs
    explicit rules — those live at the bottom and are driven by the same tokens.

    Presentation only. No structure, routes, or logic touched.
--}}
<style>
    /* =====================================================================
       1. STACKMART palette — the source of truth.
       ===================================================================== */
    :root {
        --sm-navy: #032B42;
        --sm-navy-deep: #021D2E;
        --sm-royal: #010ED0;
        --sm-lavender: #DEE0FF;
        --sm-surface: #F6F8FA;
        --sm-danger: #CF222E;
    }

    /* =====================================================================
       2. Filament ramps, re-cut in-family.

       Neutrals are navy-tinted, never "random grey": the low steps are the light
       surfaces/borders, the high steps are the dark surfaces. Filament consumes
       these as "R, G, B" triplets.
       ===================================================================== */
    :root,
    .dark {
        /* Navy-tinted neutral ramp. */
        --gray-50: 246, 248, 250;   /* #F6F8FA — light canvas (Surface) */
        --gray-100: 237, 241, 245;  /* #EDF1F5 — light hover/rail */
        --gray-200: 220, 228, 235;  /* #DCE4EB — light borders (1px) */
        --gray-300: 194, 207, 217;  /* #C2CFD9 */
        --gray-400: 147, 167, 181;  /* #93A7B5 — placeholder/icon */
        --gray-500: 108, 132, 148;  /* #6C8494 — muted navy-grey text */
        --gray-600: 82, 105, 122;   /* #52697A — secondary text */
        --gray-700: 59, 81, 100;    /* #3B5164 */
        --gray-800: 30, 58, 76;     /* #1E3A4C — dark borders */
        --gray-900: 14, 35, 49;     /* #0E2331 — DARK card */
        --gray-950: 7, 20, 29;      /* #07141D — DARK canvas */

        /* Royal ramp. 100 lands on lavender, so Filament's own "selected row",
           soft badge and highlight states become the identity's highlight tone. */
        --primary-50: 239, 240, 255;   /* #EFF0FF */
        --primary-100: 222, 224, 255;  /* #DEE0FF — Lavender */
        --primary-200: 192, 197, 255;  /* #C0C5FF */
        --primary-300: 151, 160, 250;  /* #97A0FA */
        --primary-400: 90, 103, 240;   /* #5A67F0 — dark-mode text/icon accent */
        --primary-500: 1, 14, 208;     /* #010ED0 — ROYAL */
        --primary-600: 1, 11, 187;     /* #010BBB */
        --primary-700: 1, 9, 149;      /* #010995 */
        --primary-800: 1, 7, 111;      /* #01076F */
        --primary-900: 1, 6, 82;       /* #010652 */
        --primary-950: 0, 4, 47;       /* #00042F */

        /* Danger, seeded from #CF222E. The 400 step is what dark surfaces use, and it
           has to clear AA against the #0E2331 card — #E5484D only managed 4.12:1. */
        --danger-400: 241, 102, 107; /* #F1666B — 5.26:1 on the dark card */
        --danger-500: 207, 34, 46;   /* #CF222E */
        --danger-600: 185, 28, 39;   /* #B91C27 */
        --danger-700: 153, 24, 33;   /* #991821 */
    }

    /* =====================================================================
       3. Mode tokens — the ONLY things that flip.
       ===================================================================== */
    /* LIGHT = light-on-light. The chrome is a white surface lifted off the #F6F8FA
       canvas by a 1px border — so the NAVY mark sits on it at ~13:1 and nav text is
       navy. No dark chrome anywhere in this mode. */
    :root {
        --sm-chrome: #FFFFFF;
        --sm-chrome-hover: rgba(222, 224, 255, 0.60);  /* lavender wash */
        --sm-chrome-border: #DCE4EB;                   /* gray-200, 1px */
        --sm-nav-text: #032B42;                        /* navy */
        --sm-nav-text-hover: #021D2E;                  /* navy deep */
        --sm-nav-icon: #52697A;                        /* muted navy-grey */
        --sm-nav-muted: #6C8494;
        --sm-brand-text: #032B42;                      /* wordmark: navy */
        --sm-avatar-ring: rgba(3, 43, 66, 0.18);
        --sm-accent: #010ED0;                          /* royal */
        --sm-accent-hover: #2A36DC;
        --sm-on-accent: #FFFFFF;
    }

    /* =====================================================================
       DARK = monochrome. Three deliberate tonal layers:

           chrome  #080808  (near-black) navbar / sidebar / sidebar-header
           canvas  #1E1E1E  (charcoal)   the page behind everything
           card    #282828               lifted off the canvas, 1px #333333 border

       These exact steps were chosen by measurement: #0A0A0A/#1A1A1A/#242424 separated
       the chrome from the canvas by only 1.14:1, where this spreads it to 1.20:1 and
       widens chrome-to-card to 1.36:1 — the layers read, rather than merging.

       No blue anywhere: the accent is light-grey, and the active nav item is an
       inverted pill (light background, near-black text). These overrides land AFTER
       the shared ramp block above and only inside .dark, so LIGHT MODE IS UNTOUCHED.
       ===================================================================== */
    .dark {
        /* Neutral ramp, re-cut monochrome. Filament reads the high steps as its dark
           surfaces (950 canvas, 900 cards, 700/800 borders) and the low/mid steps as
           its dark text (100/200 primary, 400 muted). */
        --gray-50: 250, 250, 250;   /* #FAFAFA */
        --gray-100: 245, 245, 245;  /* #F5F5F5 — primary text */
        --gray-200: 229, 229, 229;  /* #E5E5E5 */
        --gray-300: 212, 212, 212;  /* #D4D4D4 */
        --gray-400: 160, 160, 160;  /* #A0A0A0 — muted text */
        --gray-500: 130, 130, 130;  /* #828282 */
        --gray-600: 90, 90, 90;     /* #5A5A5A */
        --gray-700: 51, 51, 51;     /* #333333 — borders / dividers */
        --gray-800: 45, 45, 45;     /* #2D2D2D */
        --gray-900: 40, 40, 40;     /* #282828 — CARD */
        --gray-950: 30, 30, 30;     /* #1E1E1E — CANVAS */

        /* Accent ramp goes monochrome too, so links, focus rings, badges and selected
           rows inherit light-grey instead of royal — no stray blue in dark mode. */
        --primary-300: 212, 212, 212;
        --primary-400: 229, 229, 229;  /* #E5E5E5 — links / icons */
        --primary-500: 229, 229, 229;
        --primary-600: 229, 229, 229;  /* solid-button surface */
        --primary-700: 212, 212, 212;

        --sm-chrome: #080808;                          /* near-black */
        --sm-chrome-hover: rgba(255, 255, 255, 0.08);
        --sm-chrome-border: #262626;
        --sm-nav-text: #E5E5E5;
        --sm-nav-text-hover: #FFFFFF;
        --sm-nav-icon: #A0A0A0;
        --sm-nav-muted: #808080;
        --sm-brand-text: #FFFFFF;                      /* wordmark: white */
        --sm-avatar-ring: rgba(255, 255, 255, 0.20);
        /* Minimal, non-blue accent — inverted pill. */
        --sm-accent: #E5E5E5;
        --sm-accent-hover: #FFFFFF;
        --sm-on-accent: #080808;
    }

    /* Filament's solid primary button hardcodes white text over --primary-600. With a
       light accent that is white-on-white, so the pair is set explicitly here. */
    .dark .fi-btn.fi-btn-color-primary {
        background-color: var(--sm-accent) !important;
        color: var(--sm-on-accent) !important;
    }

    .dark .fi-btn.fi-btn-color-primary:hover {
        background-color: var(--sm-accent-hover) !important;
    }

    /* =====================================================================
       4. Identity geometry — 6px radius, 1px borders.
       ===================================================================== */
    .fi-btn,
    .fi-input,
    .fi-select,
    .fi-ta,
    .fi-section,
    .fi-wi-stats-overview-stat,
    .fi-dropdown-panel,
    .fi-modal-window {
        border-radius: 6px !important;
    }

    /* =====================================================================
       5. Chrome — topbar + sidebar + brand. Filament hardcodes these to
          bg-white / dark:bg-gray-900, and the dark: variants out-specify a plain
          class selector, so these overrides are !important by necessity.
       ===================================================================== */
    .fi-sidebar-header,
    .fi-topbar > nav,
    .fi-sidebar,
    .fi-main-sidebar,
    .fi-sidebar-nav {
        background-color: var(--sm-chrome) !important;
    }

    .fi-sidebar-header,
    .fi-topbar > nav {
        --tw-ring-color: var(--sm-chrome-border) !important;
        box-shadow: none !important;
    }

    /* Topbar controls were tuned for a white bar. */
    .fi-topbar > nav .fi-icon-btn,
    .fi-topbar > nav .fi-icon-btn-icon,
    .fi-topbar > nav .fi-breadcrumbs,
    .fi-topbar > nav .fi-breadcrumbs a,
    .fi-topbar > nav .fi-breadcrumbs-item-label,
    .fi-topbar > nav .fi-dropdown-trigger button {
        color: var(--sm-nav-text) !important;
    }

    .fi-topbar > nav .fi-icon-btn:hover,
    .fi-topbar > nav .fi-breadcrumbs a:hover {
        color: var(--sm-nav-text-hover) !important;
    }

    .fi-topbar > nav .fi-user-avatar {
        --tw-ring-color: var(--sm-avatar-ring) !important;
    }

    /* ---- Nav items: same treatment in both modes, only tones flip. ---- */
    .fi-sidebar-item-label {
        color: var(--sm-nav-text) !important;
    }

    .fi-sidebar-item-icon {
        color: var(--sm-nav-icon) !important;
    }

    .fi-sidebar-item-button:hover,
    .fi-sidebar-item-button:focus-visible {
        background-color: var(--sm-chrome-hover) !important;
        border-radius: 6px !important;
    }

    .fi-sidebar-item-button:hover .fi-sidebar-item-label,
    .fi-sidebar-item-button:focus-visible .fi-sidebar-item-label,
    .fi-sidebar-item-button:hover .fi-sidebar-item-icon,
    .fi-sidebar-item-button:focus-visible .fi-sidebar-item-icon {
        color: var(--sm-nav-text-hover) !important;
    }

    /* Active page — royal in BOTH modes (Filament's own text-primary-600 on a
       light row is unreadable against the chrome). */
    .fi-sidebar-item-active > .fi-sidebar-item-button {
        background-color: var(--sm-accent) !important;
        border-radius: 6px !important;
    }

    .fi-sidebar-item-active > .fi-sidebar-item-button .fi-sidebar-item-label,
    .fi-sidebar-item-active > .fi-sidebar-item-button .fi-sidebar-item-icon {
        color: var(--sm-on-accent) !important;
    }

    .fi-sidebar-item-active > .fi-sidebar-item-button:hover {
        background-color: var(--sm-accent-hover) !important;
    }

    .fi-sidebar-group-label {
        color: var(--sm-nav-muted) !important;
        font-size: 0.6875rem !important;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .fi-sidebar-group-button .fi-icon-btn,
    .fi-sidebar-group-button .fi-icon-btn-icon {
        color: var(--sm-nav-muted) !important;
    }

    /* =====================================================================
       6. Brand lockup + the per-mode logo swap (pure CSS, no JS).
       ===================================================================== */
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
        color: var(--sm-brand-text);
        font-weight: 700;
        font-size: 1.0625rem;
        letter-spacing: 0.06em;
        line-height: 1;
    }

    /* The mark contrasts with the CHROME it sits on, and the chrome now flips tone
       with the mode: light chrome -> NAVY mark (13.08:1), dark chrome -> WHITE mark
       (7.76:1). Pure CSS, no JS. */
    .sm-brand-mark--white {
        display: none;
    }

    .sm-brand-mark--navy {
        display: block;
    }

    .dark .sm-brand-mark--navy {
        display: none;
    }

    .dark .sm-brand-mark--white {
        display: block;
    }

    /* Mobile: the sidebar (and its brand) goes off-canvas, so the topbar carries a
       second copy. Hidden on desktop so only one logo ever shows. */
    .sm-brand--topbar {
        display: none;
    }

    @media (max-width: 1023.98px) {
        .sm-brand--topbar {
            display: inline-flex;
            margin-inline-start: 0.25rem;
        }

        .sm-brand--topbar .sm-brand-wordmark {
            display: none;
        }
    }
</style>
