<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ProductSeeder extends Seeder
{
    /**
     * Exactly 12 published listings — the frozen catalog the frontend builds against.
     *
     * demo_url / repository_url are deliberately spread so every button + icon state is testable:
     *   - github.com repos ............. inboxzero-ai, deploydeck
     *   - gitlab.com repos ............. pixelforge, cronpilot
     *   - bitbucket.org repos ......... substack-lite, launchbase
     *   - self-hosted git repos ....... focusflow (git.example.dev), tripstash (git.selfhost.io)
     *   - demo only (no repo) ......... cartspark, fittrack
     *   - repo only (no demo) ......... pixelforge, substack-lite, cronpilot, tripstash
     *   - both demo + repo ............ inboxzero-ai, focusflow, deploydeck, launchbase
     *   - NEITHER url ................. notevault, rentreach
     * All URLs are HTTPS. Prices span $900–$25,000 (integer cents).
     */
    public function run(): void
    {
        $categories = Category::pluck('id', 'slug');

        $published = Carbon::parse('2026-05-01 10:00:00');

        foreach ($this->listings() as $i => $listing) {
            $categorySlug = $listing['category'];
            unset($listing['category']);

            Product::updateOrCreate(
                ['slug' => $listing['slug']],
                array_merge($listing, [
                    'category_id' => $categories[$categorySlug],
                    'currency' => 'USD',
                    'status' => Product::STATUS_PUBLISHED,
                    'published_at' => $published->copy()->addDays($i * 3),
                    'deliverable_path' => null, // real ZIP uploaded via Filament (private disk) Days 6–7
                ])
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function listings(): array
    {
        return [
            [
                'category' => 'ai-tools',
                'title' => 'InboxZero AI',
                'slug' => 'inboxzero-ai',
                'tagline' => 'AI email triage that clears your inbox before coffee',
                'description' => "InboxZero AI reads, categorises and drafts replies for busy founders. It plugs into Gmail and Outlook, learns your tone, and surfaces only the messages that need you.\n\nShips with the full Laravel + Next.js codebase, the OpenAI prompt library, and a one-command deploy script.",
                'price_cents' => 480000,
                'tech_stack' => ['Laravel', 'Next.js', 'MySQL', 'OpenAI', 'Redis'],
                'metrics' => ['mrr' => 4200, 'users' => 310, 'founded' => '2024', 'profit' => 3600],
                'included' => ['Full source code', 'OpenAI prompt library', 'Deployment guide', '30-day support'],
                'faq' => [
                    ['q' => 'Is the domain included?', 'a' => 'No — you receive the code and assets only.'],
                    ['q' => 'Which mailboxes are supported?', 'a' => 'Gmail and Outlook via OAuth out of the box.'],
                ],
                'images' => ['placeholders/inboxzero-1.png', 'placeholders/inboxzero-2.png', 'placeholders/inboxzero-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.inboxzero.app',
                'repository_url' => 'https://github.com/acme/inboxzero',
            ],
            [
                'category' => 'ai-tools',
                'title' => 'PixelForge',
                'slug' => 'pixelforge',
                'tagline' => 'Generate on-brand marketing images from a prompt',
                'description' => "PixelForge turns a short brief into a set of on-brand social and ad creatives. Includes a credit-based billing model and a moderation queue.\n\nHanded over as a complete Vue + Node stack with worker queues wired up.",
                'price_cents' => 1250000,
                'tech_stack' => ['Vue', 'Node.js', 'PostgreSQL', 'OpenAI', 'Docker'],
                'metrics' => ['mrr' => 9100, 'users' => 640, 'founded' => '2023', 'profit' => 5400],
                'included' => ['Full source code', 'Worker queue setup', 'Admin dashboard', 'API documentation'],
                'faq' => null,
                'images' => ['placeholders/pixelforge-1.png', 'placeholders/pixelforge-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://gitlab.com/acme/pixelforge',
            ],
            [
                'category' => 'e-commerce',
                'title' => 'CartSpark',
                'slug' => 'cartspark',
                'tagline' => 'Headless checkout that lifts conversion out of the box',
                'description' => "CartSpark is a headless checkout and cart service with abandoned-cart recovery and one-click upsells. Battle-tested on live stores.\n\nDelivered as a Next.js storefront plus a Laravel API.",
                'price_cents' => 990000,
                'tech_stack' => ['Laravel', 'Next.js', 'MySQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 7300, 'users' => 1200, 'founded' => '2022', 'profit' => 4800],
                'included' => ['Full source code', 'Storefront theme', 'Deployment guide', '1 year of updates'],
                'faq' => [
                    ['q' => 'Does it handle taxes?', 'a' => 'Yes — configurable tax rules per region are included.'],
                ],
                'images' => ['placeholders/cartspark-1.png', 'placeholders/cartspark-2.png', 'placeholders/cartspark-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.cartspark.io',
                'repository_url' => null,
            ],
            [
                'category' => 'e-commerce',
                'title' => 'SubStack Lite',
                'slug' => 'substack-lite',
                'tagline' => 'Turn any store into a subscription business',
                'description' => "SubStack Lite adds recurring plans, dunning and a customer portal to an existing catalogue. Lightweight and provider-agnostic.\n\nHanded over as a self-contained Laravel package with tests.",
                'price_cents' => 320000,
                'tech_stack' => ['Laravel', 'Livewire', 'MySQL'],
                'metrics' => ['mrr' => 2100, 'users' => 430, 'founded' => '2023', 'profit' => 1500],
                'included' => ['Full source code', 'Customer portal', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/substack-lite-1.png', 'placeholders/substack-lite-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://bitbucket.org/acme/substack-lite',
            ],
            [
                'category' => 'productivity',
                'title' => 'FocusFlow',
                'slug' => 'focusflow',
                'tagline' => 'A calm daily planner with built-in time-blocking',
                'description' => "FocusFlow pairs a distraction-free task list with automatic time-blocking and a weekly review. Loved by indie makers.\n\nShips with the React front end and a Node API, plus a self-hosted deploy playbook.",
                'price_cents' => 190000,
                'tech_stack' => ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
                'metrics' => ['mrr' => 1400, 'users' => 890, 'founded' => '2024', 'profit' => 1100],
                'included' => ['Full source code', 'Deployment guide', '30-day support'],
                'faq' => [
                    ['q' => 'Is there a mobile app?', 'a' => 'The web app is fully responsive; no native app is included.'],
                ],
                'images' => ['placeholders/focusflow-1.png', 'placeholders/focusflow-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.focusflow.app',
                'repository_url' => 'https://git.example.dev/acme/focusflow',
            ],
            [
                'category' => 'productivity',
                'title' => 'NoteVault',
                'slug' => 'notevault',
                'tagline' => 'End-to-end encrypted notes for teams',
                'description' => "NoteVault is a zero-knowledge notes app with shared vaults and offline sync. Security-first, audited crypto.\n\nDelivered as a complete source drop with the encryption library documented.",
                'price_cents' => 90000,
                'tech_stack' => ['Laravel', 'Vue', 'MySQL'],
                'metrics' => ['mrr' => 700, 'users' => 260, 'founded' => '2025', 'profit' => 400],
                'included' => ['Full source code', 'Encryption library docs', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/notevault-1.png', 'placeholders/notevault-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => null,
            ],
            [
                'category' => 'dev-tools',
                'title' => 'DeployDeck',
                'slug' => 'deploydeck',
                'tagline' => 'Self-hosted PaaS for shipping Laravel apps',
                'description' => "DeployDeck is a self-hosted deployment dashboard — zero-downtime releases, env management and log streaming for Laravel and Node apps.\n\nHanded over as the full platform plus provisioning scripts.",
                'price_cents' => 1500000,
                'tech_stack' => ['Laravel', 'Next.js', 'PostgreSQL', 'Docker', 'AWS'],
                'metrics' => ['mrr' => 11800, 'users' => 540, 'founded' => '2022', 'profit' => 8200],
                'included' => ['Full source code', 'Provisioning scripts', 'Admin dashboard', '1 year of updates'],
                'faq' => [
                    ['q' => 'Which servers are supported?', 'a' => 'Any Ubuntu 22.04 VPS; provisioning scripts included.'],
                ],
                'images' => ['placeholders/deploydeck-1.png', 'placeholders/deploydeck-2.png', 'placeholders/deploydeck-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.deploydeck.dev',
                'repository_url' => 'https://github.com/acme/deploydeck',
            ],
            [
                'category' => 'dev-tools',
                'title' => 'CronPilot',
                'slug' => 'cronpilot',
                'tagline' => 'Monitoring and alerts for your scheduled jobs',
                'description' => "CronPilot watches your cron jobs and queues, alerting the moment one misses its window. Simple ping API, rich dashboard.\n\nDelivered as a Laravel app with a Tailwind dashboard.",
                'price_cents' => 240000,
                'tech_stack' => ['Laravel', 'Tailwind CSS', 'MySQL', 'Redis'],
                'metrics' => ['mrr' => 1900, 'users' => 720, 'founded' => '2023', 'profit' => 1300],
                'included' => ['Full source code', 'Ping API docs', 'Deployment guide'],
                'faq' => null,
                'images' => ['placeholders/cronpilot-1.png', 'placeholders/cronpilot-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://gitlab.com/acme/cronpilot',
            ],
            [
                'category' => 'marketplace',
                'title' => 'LaunchBase',
                'slug' => 'launchbase',
                'tagline' => 'A two-sided marketplace starter kit',
                'description' => "LaunchBase is a production marketplace boilerplate — listings, escrow-ready payments, reviews and messaging. Skip six months of build.\n\nShips as a full Next.js + Laravel monorepo.",
                'price_cents' => 2500000,
                'tech_stack' => ['Laravel', 'Next.js', 'PostgreSQL', 'TypeScript', 'Redis'],
                'metrics' => ['mrr' => 18400, 'users' => 2100, 'founded' => '2021', 'profit' => 12600],
                'included' => ['Full source code', 'Deployment guide', 'Admin dashboard', 'API documentation', '1 year of updates'],
                'faq' => [
                    ['q' => 'Is payment processing wired up?', 'a' => 'The payment layer is provider-agnostic and ready to connect.'],
                ],
                'images' => ['placeholders/launchbase-1.png', 'placeholders/launchbase-2.png', 'placeholders/launchbase-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.launchbase.co',
                'repository_url' => 'https://bitbucket.org/acme/launchbase',
            ],
            [
                'category' => 'marketplace',
                'title' => 'RentReach',
                'slug' => 'rentreach',
                'tagline' => 'Short-term rental listings and booking engine',
                'description' => "RentReach is a niche rental marketplace with calendar sync, instant booking and payout scheduling. Clean, documented code.\n\nDelivered as a complete source drop.",
                'price_cents' => 750000,
                'tech_stack' => ['Laravel', 'Vue', 'MySQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 5600, 'users' => 980, 'founded' => '2022', 'profit' => 3900],
                'included' => ['Full source code', 'Deployment guide', '30-day support'],
                'faq' => null,
                'images' => ['placeholders/rentreach-1.png', 'placeholders/rentreach-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => null,
            ],
            [
                'category' => 'mobile',
                'title' => 'FitTrack',
                'slug' => 'fittrack',
                'tagline' => 'Cross-platform workout and nutrition tracker',
                'description' => "FitTrack is a Flutter fitness app with workout plans, macro tracking and a coaching upsell. App-store ready.\n\nHanded over with the Flutter client and a Laravel API backend.",
                'price_cents' => 560000,
                'tech_stack' => ['Flutter', 'Laravel', 'MySQL'],
                'metrics' => ['mrr' => 4100, 'users' => 3400, 'founded' => '2023', 'profit' => 2700],
                'included' => ['Full source code', 'Flutter client', 'Setup documentation', '30-day support'],
                'faq' => [
                    ['q' => 'Are the app-store accounts included?', 'a' => 'No — you publish under your own developer accounts.'],
                ],
                'images' => ['placeholders/fittrack-1.png', 'placeholders/fittrack-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.fittrack.app',
                'repository_url' => null,
            ],
            [
                'category' => 'mobile',
                'title' => 'TripStash',
                'slug' => 'tripstash',
                'tagline' => 'Offline-first travel itinerary planner',
                'description' => "TripStash keeps every booking, map and note for a trip in one offline-first app. Sync when you land.\n\nDelivered as a React Native client with a Node sync server.",
                'price_cents' => 1100000,
                'tech_stack' => ['React Native', 'Node.js', 'PostgreSQL', 'GraphQL'],
                'metrics' => ['mrr' => 6800, 'users' => 1500, 'founded' => '2024', 'profit' => 4300],
                'included' => ['Full source code', 'Sync server', 'Deployment guide', 'API documentation'],
                'faq' => null,
                'images' => ['placeholders/tripstash-1.png', 'placeholders/tripstash-2.png', 'placeholders/tripstash-3.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://git.selfhost.io/acme/tripstash',
            ],
        ];
    }
}
