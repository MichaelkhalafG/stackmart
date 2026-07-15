<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use Filament\Pages\Auth\Login;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Filament\Widgets;
use Illuminate\Contracts\View\View;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            // The API is a headless backend served under /api — the panel owns the web root.
            ->path('')
            ->login()
            ->brandName('STACKMART')
            ->brandLogo(fn (): View => view('filament.admin.brand'))
            ->brandLogoHeight('2rem')
            ->colors([
                // STACKMART accent — royal blue. Filament derives the shade ramp from this hex.
                'primary' => Color::hex('#010ED0'),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                // AccountWidget = the "Welcome / Sign out" block. Filament's own
                // info widget (logo + version + docs/GitHub links) is deliberately not
                // registered — this panel carries STACKMART branding, not Filament's.
                Widgets\AccountWidget::class,
            ])
            // Decorative-only backdrop behind the stock login card (STACKMART identity).
            // Scoped to the login page so it never leaks into the rest of the panel.
            ->renderHook(
                PanelsRenderHook::BODY_START,
                fn (): View => view('filament.admin.login-backdrop'),
                scopes: Login::class,
            )
            // Navy top strip (sidebar header + topbar) — panel-wide, presentation only.
            ->renderHook(
                PanelsRenderHook::BODY_START,
                fn (): View => view('filament.admin.chrome'),
            )
            // On phones the sidebar (and its header, which holds the brand) is off-canvas,
            // so the brand would vanish. Render it in the topbar too; CSS shows this copy
            // only below the lg breakpoint, so desktop never sees two logos.
            ->renderHook(
                PanelsRenderHook::TOPBAR_START,
                fn (): View => view('filament.admin.brand', ['context' => 'topbar']),
            )
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
