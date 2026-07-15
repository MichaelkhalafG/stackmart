<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ProductSeeder extends Seeder
{
    /** Flat platform commission for every listing (DR-8). */
    public const COMMISSION_RATE = 0.200;

    /**
     * Which seller submitted which listing — the payee for that product's orders.
     *
     * Four sellers, deliberately spread across price bands so the dashboard's per-seller ranking
     * has something to rank. THREE of the original listings are intentionally absent (substack-lite,
     * rentreach, fittrack): those are admin-authored with no payee, which is what feeds "Blocked
     * payouts". The many additional catalog listings are also admin-authored (no payee) — only the
     * nine mapped here carry seeded orders, so the payout demo stays small and legible.
     *
     * @return array<string, array{name: string, email: string}>
     */
    private function sellers(): array
    {
        $ada = ['name' => 'Ada Okafor', 'email' => 'ada@sellers.test'];
        $grace = ['name' => 'Grace Lin', 'email' => 'grace@sellers.test'];
        $linus = ['name' => 'Linus Vega', 'email' => 'linus@sellers.test'];
        $mira = ['name' => 'Mira Haddad', 'email' => 'mira@sellers.test'];

        return [
            'inboxzero-ai' => $ada,
            'focusflow' => $ada,
            'notevault' => $ada,
            'cartspark' => $grace,
            'cronpilot' => $grace,
            'pixelforge' => $linus,
            'deploydeck' => $linus,
            'launchbase' => $mira,
            'tripstash' => $mira,
            // substack-lite / rentreach / fittrack → no seller (admin-authored).
        ];
    }

    /**
     * The published catalog — the original 12 contract listings the frontend was built
     * against, plus a wider set that gives the marketplace real volume so filters, search, category
     * pages, pagination and the price-range/sort controls are exercised with a lifelike spread.
     *
     * Money is NEVER hand-written. Each listing declares its monthly revenue (`metrics.mrr`, in
     * whole dollars) and an acquisition `multiple`; `run()` derives `price_cents` as
     * mrr × multiple × 100. Real micro-SaaS sells for ~24–36× MONTHLY revenue, so every asking price
     * is coherent with its metrics by construction and can never drift. The catalog spans a wide
     * band, from a few small ~$9k–$25k listings to a handful of premium ~$550k–$1.4M ones.
     *
     * The original 12 keep their exact slugs/titles/taglines/descriptions (the frozen contract) and
     * their demo_url / repository_url spread, so every button + icon state is still testable:
     *   - github.com repos ............. inboxzero-ai, deploydeck (+ several new listings)
     *   - gitlab.com repos ............. pixelforge, cronpilot
     *   - bitbucket.org repos ......... substack-lite, launchbase
     *   - self-hosted git repos ....... focusflow (git.example.dev), tripstash (git.selfhost.io)
     *   - demo only (no repo) ......... cartspark, fittrack
     *   - repo only (no demo) ......... pixelforge, substack-lite, cronpilot, tripstash
     *   - both demo + repo ............ inboxzero-ai, focusflow, deploydeck, launchbase
     *   - NEITHER url ................. notevault, rentreach
     * All URLs are HTTPS.
     */
    public function run(): void
    {
        $categories = Category::pluck('id', 'slug');

        $published = Carbon::parse('2026-05-01 10:00:00');

        foreach ($this->listings() as $i => $listing) {
            $categorySlug = $listing['category'];
            unset($listing['category']);

            // Asking price is DERIVED from monthly revenue at a realistic acquisition multiple
            // (24–36× MRR). Deriving it here (rather than hand-writing price_cents) guarantees the
            // money stays coherent with the metrics for every listing, old and new.
            $multiple = $listing['multiple'];
            unset($listing['multiple']);
            $listing['price_cents'] = (int) round($listing['metrics']['mrr'] * $multiple) * 100;

            // The seller is DENORMALISED onto the listing (there are no seller accounts) — this is
            // what lets `order → product → seller_email` resolve for payouts. Listings absent from
            // the map are admin-authored and have NO payee: a normal state the dashboard surfaces
            // as "Blocked payouts".
            $seller = $this->sellers()[$listing['slug']] ?? null;

            Product::updateOrCreate(
                ['slug' => $listing['slug']],
                array_merge($listing, [
                    'category_id' => $categories[$categorySlug],
                    'currency' => 'USD',
                    'status' => Product::STATUS_PUBLISHED,
                    'published_at' => $published->copy()->addDays($i * 2),
                    'deliverable_path' => null, // real ZIP uploaded via Filament (private disk) Days 6–7
                    'seller_name' => $seller['name'] ?? null,
                    'seller_email' => $seller['email'] ?? null,
                    'commission_rate' => self::COMMISSION_RATE, // flat 20% (DR-8)
                ])
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function listings(): array
    {
        return array_merge($this->contractListings(), $this->catalogListings());
    }

    /**
     * The original 12 contract listings. Slugs/titles/taglines/descriptions are frozen; only the
     * money is now derived from MRR (via `multiple`) instead of a hand-written price.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function contractListings(): array
    {
        return [
            [
                'category' => 'ai-tools',
                'title' => 'InboxZero AI',
                'slug' => 'inboxzero-ai',
                'tagline' => 'AI email triage that clears your inbox before coffee',
                'description' => "InboxZero AI reads, categorises and drafts replies for busy founders. It plugs into Gmail and Outlook, learns your tone, and surfaces only the messages that need you.\n\nShips with the full Laravel + Next.js codebase, the OpenAI prompt library, and a one-command deploy script.",
                'multiple' => 28,
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
                'multiple' => 30,
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
                'multiple' => 32,
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
                'multiple' => 26,
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
                'multiple' => 30,
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
                'multiple' => 28,
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
                'multiple' => 34,
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
                'multiple' => 29,
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
                'multiple' => 36,
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
                'multiple' => 27,
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
                'multiple' => 25,
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
                'multiple' => 31,
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

    /**
     * The wider catalog — 36 additional admin-authored listings that give every filter, the search,
     * the category pages and pagination real volume. Six per category; tech stacks are drawn so each
     * of the eight filterable stacks (Laravel, Next.js, React, Vue, Node.js, Python, TypeScript,
     * Tailwind CSS) has coverage; prices (derived from MRR) span ~$9k to ~$1.4M.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function catalogListings(): array
    {
        return [
            // ── AI Tools ──────────────────────────────────────────────────────────────────
            [
                'category' => 'ai-tools',
                'title' => 'VoiceScribe',
                'slug' => 'voicescribe',
                'tagline' => 'AI meeting notes that write themselves',
                'description' => "VoiceScribe joins your calls, transcribes every speaker, and ships a shareable summary with action items before the meeting ends.\n\nDelivered as a Next.js app with a Python transcription worker.",
                'multiple' => 31,
                'tech_stack' => ['Next.js', 'Node.js', 'Python', 'OpenAI', 'PostgreSQL'],
                'metrics' => ['mrr' => 3200, 'users' => 480, 'founded' => '2023', 'profit' => 2100],
                'included' => ['Full source code', 'Transcription worker', 'Deployment guide', 'API documentation'],
                'faq' => null,
                'images' => ['placeholders/voicescribe-1.png', 'placeholders/voicescribe-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.voicescribe.app',
                'repository_url' => 'https://github.com/acme/voicescribe',
            ],
            [
                'category' => 'ai-tools',
                'title' => 'PromptDesk',
                'slug' => 'promptdesk',
                'tagline' => 'A prompt CMS and A/B testing suite for LLM apps',
                'description' => "PromptDesk gives product teams a place to version, test and ship prompts without a redeploy. Includes evaluation runs and rollback.\n\nHanded over as a Laravel + Vue application with a Redis-backed queue.",
                'multiple' => 33,
                'tech_stack' => ['Laravel', 'Vue', 'MySQL', 'Redis', 'OpenAI'],
                'metrics' => ['mrr' => 5400, 'users' => 620, 'founded' => '2023', 'profit' => 3500],
                'included' => ['Full source code', 'Admin dashboard', 'Setup documentation', '30-day support'],
                'faq' => [
                    ['q' => 'Which providers are supported?', 'a' => 'The provider layer is abstracted; any chat-completion API can be wired in.'],
                ],
                'images' => ['placeholders/promptdesk-1.png', 'placeholders/promptdesk-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.promptdesk.io',
                'repository_url' => 'https://gitlab.com/acme/promptdesk',
            ],
            [
                'category' => 'ai-tools',
                'title' => 'ChatCortex',
                'slug' => 'chatcortex',
                'tagline' => 'Drop-in AI support agent trained on your docs',
                'description' => "ChatCortex ingests your help centre and answers customer questions in your product's voice, escalating cleanly to a human when unsure.\n\nShips as a Next.js widget plus a Python retrieval service.",
                'multiple' => 35,
                'tech_stack' => ['Next.js', 'Python', 'TypeScript', 'OpenAI', 'PostgreSQL'],
                'metrics' => ['mrr' => 12500, 'users' => 900, 'founded' => '2022', 'profit' => 8600],
                'included' => ['Full source code', 'Retrieval service', 'Admin dashboard', 'API documentation', '1 year of updates'],
                'faq' => [
                    ['q' => 'Can it run on our own vector store?', 'a' => 'Yes — the retrieval layer is pluggable and documented.'],
                ],
                'images' => ['placeholders/chatcortex-1.png', 'placeholders/chatcortex-2.png', 'placeholders/chatcortex-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.chatcortex.ai',
                'repository_url' => 'https://github.com/acme/chatcortex',
            ],
            [
                'category' => 'ai-tools',
                'title' => 'LeadSift AI',
                'slug' => 'leadsift-ai',
                'tagline' => 'Score and route inbound leads with AI',
                'description' => "LeadSift reads every inbound message, scores intent, and routes hot leads to the right rep in seconds. Built for lean sales teams.\n\nDelivered as a Laravel API with a React dashboard.",
                'multiple' => 28,
                'tech_stack' => ['Laravel', 'React', 'MySQL', 'Python'],
                'metrics' => ['mrr' => 2100, 'users' => 340, 'founded' => '2024', 'profit' => 1400],
                'included' => ['Full source code', 'Deployment guide', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/leadsift-ai-1.png', 'placeholders/leadsift-ai-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.leadsift.ai',
                'repository_url' => null,
            ],
            [
                'category' => 'ai-tools',
                'title' => 'AltTextly',
                'slug' => 'alttextly',
                'tagline' => 'Automatic alt-text and image SEO at scale',
                'description' => "AltTextly generates accurate, on-brand alt text for entire image libraries in one pass, improving accessibility and search ranking.\n\nHanded over as a Node.js service with a TypeScript SDK.",
                'multiple' => 26,
                'tech_stack' => ['Node.js', 'TypeScript', 'OpenAI'],
                'metrics' => ['mrr' => 420, 'users' => 190, 'founded' => '2025', 'profit' => 260],
                'included' => ['Full source code', 'TypeScript SDK', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/alttextly-1.png', 'placeholders/alttextly-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://bitbucket.org/acme/alttextly',
            ],
            [
                'category' => 'ai-tools',
                'title' => 'ForecastIQ',
                'slug' => 'forecastiq',
                'tagline' => 'AI revenue forecasting for SaaS finance teams',
                'description' => "ForecastIQ turns your billing data into scenario-based revenue forecasts, flagging churn risk and expansion before the board meeting.\n\nShips as a Python analytics engine with a React front end.",
                'multiple' => 34,
                'tech_stack' => ['Python', 'React', 'TypeScript', 'PostgreSQL', 'Redis'],
                'metrics' => ['mrr' => 8800, 'users' => 410, 'founded' => '2022', 'profit' => 6100],
                'included' => ['Full source code', 'Analytics engine', 'Admin dashboard', 'API documentation'],
                'faq' => [
                    ['q' => 'What billing systems does it read?', 'a' => 'Any provider — it ingests a normalised CSV/JSON, with adapters documented.'],
                ],
                'images' => ['placeholders/forecastiq-1.png', 'placeholders/forecastiq-2.png', 'placeholders/forecastiq-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.forecastiq.app',
                'repository_url' => 'https://github.com/acme/forecastiq',
            ],

            // ── E-commerce ────────────────────────────────────────────────────────────────
            [
                'category' => 'e-commerce',
                'title' => 'ReviewNest',
                'slug' => 'reviewnest',
                'tagline' => 'Collect and showcase product reviews',
                'description' => "ReviewNest requests, moderates and displays customer reviews with photo support and rich snippets that lift store conversion.\n\nDelivered as a Laravel + Vue application.",
                'multiple' => 27,
                'tech_stack' => ['Laravel', 'Vue', 'MySQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 1600, 'users' => 520, 'founded' => '2023', 'profit' => 1050],
                'included' => ['Full source code', 'Storefront widget', 'Deployment guide'],
                'faq' => null,
                'images' => ['placeholders/reviewnest-1.png', 'placeholders/reviewnest-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.reviewnest.io',
                'repository_url' => null,
            ],
            [
                'category' => 'e-commerce',
                'title' => 'DropRoute',
                'slug' => 'droproute',
                'tagline' => 'Dropshipping order automation and supplier sync',
                'description' => "DropRoute routes orders to the cheapest in-stock supplier, syncs tracking back to the store, and reconciles costs automatically.\n\nHanded over as a Next.js dashboard with a Node.js sync worker.",
                'multiple' => 30,
                'tech_stack' => ['Next.js', 'Node.js', 'PostgreSQL', 'TypeScript'],
                'metrics' => ['mrr' => 6200, 'users' => 780, 'founded' => '2022', 'profit' => 4100],
                'included' => ['Full source code', 'Sync worker', 'Admin dashboard', 'Deployment guide'],
                'faq' => [
                    ['q' => 'Is it tied to one storefront?', 'a' => 'No — it talks to stores over a documented webhook + REST contract.'],
                ],
                'images' => ['placeholders/droproute-1.png', 'placeholders/droproute-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.droproute.app',
                'repository_url' => 'https://github.com/acme/droproute',
            ],
            [
                'category' => 'e-commerce',
                'title' => 'GiftCardly',
                'slug' => 'giftcardly',
                'tagline' => 'Sell and redeem digital gift cards',
                'description' => "GiftCardly adds branded digital gift cards to any store, with balance tracking, partial redemption and fraud checks.\n\nDelivered as a self-contained Laravel + Livewire package.",
                'multiple' => 25,
                'tech_stack' => ['Laravel', 'Livewire', 'MySQL'],
                'metrics' => ['mrr' => 900, 'users' => 300, 'founded' => '2024', 'profit' => 560],
                'included' => ['Full source code', 'Customer portal', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/giftcardly-1.png', 'placeholders/giftcardly-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://gitlab.com/acme/giftcardly',
            ],
            [
                'category' => 'e-commerce',
                'title' => 'BundleBoost',
                'slug' => 'bundleboost',
                'tagline' => 'Product bundling and upsell engine',
                'description' => "BundleBoost builds smart bundles and one-click upsells from your catalogue, with per-rule analytics so you can see what actually lifts AOV.\n\nHanded over as a React storefront module plus a Node.js API.",
                'multiple' => 32,
                'tech_stack' => ['React', 'Node.js', 'MySQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 4700, 'users' => 910, 'founded' => '2023', 'profit' => 3000],
                'included' => ['Full source code', 'Storefront module', 'Admin dashboard', 'Deployment guide'],
                'faq' => null,
                'images' => ['placeholders/bundleboost-1.png', 'placeholders/bundleboost-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.bundleboost.io',
                'repository_url' => 'https://bitbucket.org/acme/bundleboost',
            ],
            [
                'category' => 'e-commerce',
                'title' => 'ShipTrackr',
                'slug' => 'shiptrackr',
                'tagline' => 'Branded post-purchase order tracking',
                'description' => "ShipTrackr replaces the carrier's ugly tracking page with a branded, upsell-ready one and keeps buyers updated by email and SMS.\n\nDelivered as a Vue front end with a Node.js tracking service.",
                'multiple' => 29,
                'tech_stack' => ['Vue', 'Node.js', 'PostgreSQL', 'TypeScript'],
                'metrics' => ['mrr' => 3400, 'users' => 660, 'founded' => '2023', 'profit' => 2200],
                'included' => ['Full source code', 'Tracking service', 'Deployment guide', '30-day support'],
                'faq' => null,
                'images' => ['placeholders/shiptrackr-1.png', 'placeholders/shiptrackr-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.shiptrackr.app',
                'repository_url' => null,
            ],
            [
                'category' => 'e-commerce',
                'title' => 'WarehouseWize',
                'slug' => 'warehousewize',
                'tagline' => 'Inventory and multichannel stock sync',
                'description' => "WarehouseWize keeps stock accurate across every sales channel in real time, with low-stock alerts, purchase orders and barcode receiving.\n\nShips as a Laravel + Next.js platform with Redis-backed sync.",
                'multiple' => 36,
                'tech_stack' => ['Laravel', 'Next.js', 'MySQL', 'Redis', 'AWS'],
                'metrics' => ['mrr' => 15200, 'users' => 1150, 'founded' => '2021', 'profit' => 10400],
                'included' => ['Full source code', 'Admin dashboard', 'API documentation', '1 year of updates'],
                'faq' => [
                    ['q' => 'How many channels can it sync?', 'a' => 'Unlimited — each channel is a documented adapter.'],
                ],
                'images' => ['placeholders/warehousewize-1.png', 'placeholders/warehousewize-2.png', 'placeholders/warehousewize-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.warehousewize.com',
                'repository_url' => 'https://github.com/acme/warehousewize',
            ],

            // ── Productivity ──────────────────────────────────────────────────────────────
            [
                'category' => 'productivity',
                'title' => 'StandupBot',
                'slug' => 'standupbot',
                'tagline' => 'Async daily standups for remote teams',
                'description' => "StandupBot collects async check-ins on a schedule, rolls them into a digest, and surfaces blockers so nobody has to sit in a status meeting.\n\nDelivered as a Node.js service with a TypeScript admin.",
                'multiple' => 28,
                'tech_stack' => ['Node.js', 'TypeScript', 'PostgreSQL'],
                'metrics' => ['mrr' => 2700, 'users' => 1400, 'founded' => '2023', 'profit' => 1800],
                'included' => ['Full source code', 'Deployment guide', 'API documentation'],
                'faq' => null,
                'images' => ['placeholders/standupbot-1.png', 'placeholders/standupbot-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.standupbot.app',
                'repository_url' => 'https://github.com/acme/standupbot',
            ],
            [
                'category' => 'productivity',
                'title' => 'DocuMint',
                'slug' => 'documint',
                'tagline' => 'Turn docs into shareable knowledge bases',
                'description' => "DocuMint turns scattered documents into a searchable, permissioned knowledge base with versioning and a clean public portal.\n\nHanded over as a Laravel + Vue application.",
                'multiple' => 31,
                'tech_stack' => ['Laravel', 'Vue', 'MySQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 5100, 'users' => 830, 'founded' => '2022', 'profit' => 3300],
                'included' => ['Full source code', 'Public portal theme', 'Deployment guide', '30-day support'],
                'faq' => null,
                'images' => ['placeholders/documint-1.png', 'placeholders/documint-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.documint.io',
                'repository_url' => null,
            ],
            [
                'category' => 'productivity',
                'title' => 'TimeboxHQ',
                'slug' => 'timeboxhq',
                'tagline' => 'Calendar-based time tracking for teams',
                'description' => "TimeboxHQ tracks time straight from the calendar, tags it to projects, and produces billing-ready reports without manual timers.\n\nDelivered as a React front end with a Node.js API.",
                'multiple' => 26,
                'tech_stack' => ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
                'metrics' => ['mrr' => 1200, 'users' => 640, 'founded' => '2024', 'profit' => 760],
                'included' => ['Full source code', 'Deployment guide', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/timeboxhq-1.png', 'placeholders/timeboxhq-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.timeboxhq.app',
                'repository_url' => 'https://gitlab.com/acme/timeboxhq',
            ],
            [
                'category' => 'productivity',
                'title' => 'FormForge',
                'slug' => 'formforge',
                'tagline' => 'Build forms and surveys without code',
                'description' => "FormForge is a drag-and-drop form builder with logic, payments and webhooks, plus a response dashboard your whole team can read.\n\nShips as a Next.js application with a TypeScript backend.",
                'multiple' => 33,
                'tech_stack' => ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 6600, 'users' => 2200, 'founded' => '2022', 'profit' => 4400],
                'included' => ['Full source code', 'Admin dashboard', 'API documentation', '1 year of updates'],
                'faq' => [
                    ['q' => 'Does it support conditional logic?', 'a' => 'Yes — branching, calculations and hidden fields are all included.'],
                ],
                'images' => ['placeholders/formforge-1.png', 'placeholders/formforge-2.png', 'placeholders/formforge-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.formforge.io',
                'repository_url' => 'https://github.com/acme/formforge',
            ],
            [
                'category' => 'productivity',
                'title' => 'HabitLoop',
                'slug' => 'habitloop',
                'tagline' => 'Personal habit and goal tracker',
                'description' => "HabitLoop helps people build streaks with gentle reminders, weekly reviews and progress charts. Simple, calm and fast.\n\nDelivered as a Laravel + Vue application.",
                'multiple' => 24,
                'tech_stack' => ['Vue', 'Laravel', 'MySQL'],
                'metrics' => ['mrr' => 380, 'users' => 2600, 'founded' => '2024', 'profit' => 240],
                'included' => ['Full source code', 'Deployment guide', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/habitloop-1.png', 'placeholders/habitloop-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.habitloop.app',
                'repository_url' => null,
            ],
            [
                'category' => 'productivity',
                'title' => 'MeetingMiser',
                'slug' => 'meetingmiser',
                'tagline' => 'See what meetings really cost your team',
                'description' => "MeetingMiser reads your calendars and puts a dollar figure on every recurring meeting, so teams can cut the ones that are not worth it.\n\nDelivered as a React front end with a Node.js API.",
                'multiple' => 27,
                'tech_stack' => ['React', 'Node.js', 'PostgreSQL'],
                'metrics' => ['mrr' => 1900, 'users' => 720, 'founded' => '2023', 'profit' => 1250],
                'included' => ['Full source code', 'Deployment guide', 'API documentation'],
                'faq' => null,
                'images' => ['placeholders/meetingmiser-1.png', 'placeholders/meetingmiser-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://bitbucket.org/acme/meetingmiser',
            ],

            // ── Dev Tools ─────────────────────────────────────────────────────────────────
            [
                'category' => 'dev-tools',
                'title' => 'LogLantern',
                'slug' => 'loglantern',
                'tagline' => 'Self-hosted log search and alerting',
                'description' => "LogLantern ingests structured logs, makes them searchable in milliseconds, and fires alerts on patterns you define. Own your data.\n\nShips as a Node.js service with a TypeScript UI and Docker deploy.",
                'multiple' => 34,
                'tech_stack' => ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis'],
                'metrics' => ['mrr' => 7400, 'users' => 560, 'founded' => '2022', 'profit' => 5100],
                'included' => ['Full source code', 'Docker compose stack', 'Admin dashboard', 'Deployment guide'],
                'faq' => [
                    ['q' => 'What retention can it handle?', 'a' => 'Retention is storage-bound; the schema and rollups are documented.'],
                ],
                'images' => ['placeholders/loglantern-1.png', 'placeholders/loglantern-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.loglantern.dev',
                'repository_url' => 'https://github.com/acme/loglantern',
            ],
            [
                'category' => 'dev-tools',
                'title' => 'SchemaSnap',
                'slug' => 'schemasnap',
                'tagline' => 'Database schema diffing and migration review',
                'description' => "SchemaSnap diffs database schemas across environments and turns the delta into a reviewable, reversible migration plan.\n\nDelivered as a Python engine with a React review UI.",
                'multiple' => 29,
                'tech_stack' => ['Python', 'React', 'PostgreSQL'],
                'metrics' => ['mrr' => 2300, 'users' => 480, 'founded' => '2023', 'profit' => 1500],
                'included' => ['Full source code', 'CLI tool', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/schemasnap-1.png', 'placeholders/schemasnap-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://gitlab.com/acme/schemasnap',
            ],
            [
                'category' => 'dev-tools',
                'title' => 'APIForge',
                'slug' => 'apiforge',
                'tagline' => 'Mock and prototype REST APIs instantly',
                'description' => "APIForge spins up realistic mock endpoints from a schema so frontend teams can build before the backend exists, then swaps to live with one flag.\n\nDelivered as a Node.js server with a TypeScript client.",
                'multiple' => 26,
                'tech_stack' => ['Node.js', 'TypeScript', 'Redis'],
                'metrics' => ['mrr' => 1500, 'users' => 1300, 'founded' => '2024', 'profit' => 950],
                'included' => ['Full source code', 'TypeScript client', 'Deployment guide'],
                'faq' => null,
                'images' => ['placeholders/apiforge-1.png', 'placeholders/apiforge-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.apiforge.dev',
                'repository_url' => 'https://github.com/acme/apiforge',
            ],
            [
                'category' => 'dev-tools',
                'title' => 'FeatureFlint',
                'slug' => 'featureflint',
                'tagline' => 'Feature flags and gradual rollouts',
                'description' => "FeatureFlint ships feature flags, percentage rollouts and kill switches with an audit log, sub-millisecond evaluation and SDKs.\n\nShips as a Laravel + Next.js platform with Redis-backed evaluation.",
                'multiple' => 35,
                'tech_stack' => ['Laravel', 'Next.js', 'PostgreSQL', 'Redis'],
                'metrics' => ['mrr' => 9600, 'users' => 870, 'founded' => '2021', 'profit' => 6700],
                'included' => ['Full source code', 'Client SDKs', 'Admin dashboard', 'API documentation', '1 year of updates'],
                'faq' => [
                    ['q' => 'How fast is flag evaluation?', 'a' => 'Sub-millisecond — flags are cached in Redis and streamed to SDKs.'],
                ],
                'images' => ['placeholders/featureflint-1.png', 'placeholders/featureflint-2.png', 'placeholders/featureflint-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.featureflint.dev',
                'repository_url' => 'https://github.com/acme/featureflint',
            ],
            [
                'category' => 'dev-tools',
                'title' => 'StatusPageKit',
                'slug' => 'statuspagekit',
                'tagline' => 'Hosted status pages and incident updates',
                'description' => "StatusPageKit gives you a branded status page, subscriber notifications and a clean incident timeline that keeps customers informed.\n\nDelivered as a Laravel + Vue application.",
                'multiple' => 30,
                'tech_stack' => ['Laravel', 'Vue', 'MySQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 3100, 'users' => 700, 'founded' => '2023', 'profit' => 2050],
                'included' => ['Full source code', 'Status page theme', 'Deployment guide', '30-day support'],
                'faq' => null,
                'images' => ['placeholders/statuspagekit-1.png', 'placeholders/statuspagekit-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.statuspagekit.io',
                'repository_url' => null,
            ],
            [
                'category' => 'dev-tools',
                'title' => 'WebhookRelay',
                'slug' => 'webhookrelay',
                'tagline' => 'Reliable webhook delivery with retries',
                'description' => "WebhookRelay queues, signs and retries outbound webhooks, with a replay UI and dead-letter handling so you never silently lose an event.\n\nDelivered as a Python service with a self-hosted deploy playbook.",
                'multiple' => 25,
                'tech_stack' => ['Python', 'TypeScript', 'Redis'],
                'metrics' => ['mrr' => 640, 'users' => 380, 'founded' => '2024', 'profit' => 410],
                'included' => ['Full source code', 'Deployment guide', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/webhookrelay-1.png', 'placeholders/webhookrelay-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://git.selfhost.io/acme/webhookrelay',
            ],

            // ── Marketplace ───────────────────────────────────────────────────────────────
            [
                'category' => 'marketplace',
                'title' => 'HireHaven',
                'slug' => 'hirehaven',
                'tagline' => 'A niche job board and applicant tracker',
                'description' => "HireHaven runs a focused job board with a built-in applicant tracker, paid listings and employer branding pages.\n\nShips as a Laravel + Next.js monorepo.",
                'multiple' => 31,
                'tech_stack' => ['Laravel', 'Next.js', 'MySQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 4400, 'users' => 1600, 'founded' => '2022', 'profit' => 2900],
                'included' => ['Full source code', 'Admin dashboard', 'Deployment guide', '30-day support'],
                'faq' => null,
                'images' => ['placeholders/hirehaven-1.png', 'placeholders/hirehaven-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.hirehaven.co',
                'repository_url' => 'https://github.com/acme/hirehaven',
            ],
            [
                'category' => 'marketplace',
                'title' => 'GigGrid',
                'slug' => 'giggrid',
                'tagline' => 'Freelance services marketplace starter',
                'description' => "GigGrid is a services marketplace with packaged offers, milestone payments, reviews and dispute handling — a Fiverr-style build in a box.\n\nDelivered as a React front end with a Node.js API.",
                'multiple' => 33,
                'tech_stack' => ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Redis'],
                'metrics' => ['mrr' => 8100, 'users' => 3200, 'founded' => '2021', 'profit' => 5500],
                'included' => ['Full source code', 'Admin dashboard', 'API documentation', '1 year of updates'],
                'faq' => [
                    ['q' => 'Are payouts included?', 'a' => 'The payout layer is provider-agnostic and ready to connect.'],
                ],
                'images' => ['placeholders/giggrid-1.png', 'placeholders/giggrid-2.png', 'placeholders/giggrid-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.giggrid.io',
                'repository_url' => 'https://bitbucket.org/acme/giggrid',
            ],
            [
                'category' => 'marketplace',
                'title' => 'CoursePlaza',
                'slug' => 'courseplaza',
                'tagline' => 'Multi-instructor online course marketplace',
                'description' => "CoursePlaza lets many instructors publish and sell courses, with drip content, quizzes, coupons and revenue sharing built in.\n\nHanded over as a Laravel + Vue application.",
                'multiple' => 32,
                'tech_stack' => ['Laravel', 'Vue', 'MySQL', 'Redis'],
                'metrics' => ['mrr' => 5900, 'users' => 2400, 'founded' => '2022', 'profit' => 3900],
                'included' => ['Full source code', 'Admin dashboard', 'Deployment guide', 'API documentation'],
                'faq' => null,
                'images' => ['placeholders/courseplaza-1.png', 'placeholders/courseplaza-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.courseplaza.io',
                'repository_url' => null,
            ],
            [
                'category' => 'marketplace',
                'title' => 'LocalList',
                'slug' => 'locallist',
                'tagline' => 'Classifieds and local services listings',
                'description' => "LocalList is a modern classifieds platform — categorised listings, in-app chat, featured placements and moderation tools.\n\nDelivered as a Laravel + Livewire application.",
                'multiple' => 27,
                'tech_stack' => ['Laravel', 'Livewire', 'MySQL', 'Tailwind CSS'],
                'metrics' => ['mrr' => 1300, 'users' => 4200, 'founded' => '2023', 'profit' => 820],
                'included' => ['Full source code', 'Admin dashboard', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/locallist-1.png', 'placeholders/locallist-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://gitlab.com/acme/locallist',
            ],
            [
                'category' => 'marketplace',
                'title' => 'TalentPool',
                'slug' => 'talentpool',
                'tagline' => 'Vetted developer hiring marketplace',
                'description' => "TalentPool matches companies with pre-vetted engineers, handling screening, scheduling, contracts and billing end to end.\n\nShips as a Next.js + Node.js platform on AWS.",
                'multiple' => 36,
                'tech_stack' => ['Next.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS'],
                'metrics' => ['mrr' => 21000, 'users' => 2800, 'founded' => '2020', 'profit' => 14500],
                'included' => ['Full source code', 'Admin dashboard', 'API documentation', '1 year of updates'],
                'faq' => [
                    ['q' => 'Is billing wired up?', 'a' => 'The billing/payout layer is provider-agnostic and ready to connect.'],
                ],
                'images' => ['placeholders/talentpool-1.png', 'placeholders/talentpool-2.png', 'placeholders/talentpool-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.talentpool.co',
                'repository_url' => 'https://github.com/acme/talentpool',
            ],
            [
                'category' => 'marketplace',
                'title' => 'RentMyGear',
                'slug' => 'rentmygear',
                'tagline' => 'Peer-to-peer equipment rental platform',
                'description' => "RentMyGear lets people list and rent out cameras, tools and gear, with deposits, insurance add-ons and a calendar-based booking flow.\n\nDelivered as a React front end with a Laravel API.",
                'multiple' => 28,
                'tech_stack' => ['React', 'Laravel', 'MySQL'],
                'metrics' => ['mrr' => 2600, 'users' => 1500, 'founded' => '2023', 'profit' => 1700],
                'included' => ['Full source code', 'Deployment guide', '30-day support'],
                'faq' => null,
                'images' => ['placeholders/rentmygear-1.png', 'placeholders/rentmygear-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.rentmygear.io',
                'repository_url' => 'https://gitlab.com/acme/rentmygear',
            ],

            // ── Mobile ────────────────────────────────────────────────────────────────────
            [
                'category' => 'mobile',
                'title' => 'MindfulMe',
                'slug' => 'mindfulme',
                'tagline' => 'Guided meditation and mood tracking app',
                'description' => "MindfulMe pairs guided sessions with daily mood check-ins and streaks, plus a subscription paywall and offline downloads.\n\nDelivered as a React Native client with a Node.js API.",
                'multiple' => 31,
                'tech_stack' => ['React Native', 'Node.js', 'PostgreSQL'],
                'metrics' => ['mrr' => 5300, 'users' => 8600, 'founded' => '2022', 'profit' => 3500],
                'included' => ['Full source code', 'Mobile client', 'Setup documentation', '30-day support'],
                'faq' => null,
                'images' => ['placeholders/mindfulme-1.png', 'placeholders/mindfulme-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.mindfulme.app',
                'repository_url' => null,
            ],
            [
                'category' => 'mobile',
                'title' => 'SnapBudget',
                'slug' => 'snapbudget',
                'tagline' => 'Personal finance and budgeting app',
                'description' => "SnapBudget categorises spending, sets envelope budgets and nudges users before they overspend, with a premium tier for forecasts.\n\nHanded over with a Flutter client and a Laravel API backend.",
                'multiple' => 30,
                'tech_stack' => ['Flutter', 'Laravel', 'MySQL'],
                'metrics' => ['mrr' => 3700, 'users' => 6100, 'founded' => '2023', 'profit' => 2400],
                'included' => ['Full source code', 'Flutter client', 'Deployment guide', 'API documentation'],
                'faq' => [
                    ['q' => 'Does it connect to banks?', 'a' => 'Bank sync is behind a documented adapter; manual entry works out of the box.'],
                ],
                'images' => ['placeholders/snapbudget-1.png', 'placeholders/snapbudget-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.snapbudget.app',
                'repository_url' => 'https://github.com/acme/snapbudget',
            ],
            [
                'category' => 'mobile',
                'title' => 'PetPal',
                'slug' => 'petpal',
                'tagline' => 'Pet care reminders and vet records',
                'description' => "PetPal keeps vaccination dates, medications and vet visits in one place, with reminders and a shareable health record.\n\nDelivered as a React Native client with a Node.js API.",
                'multiple' => 25,
                'tech_stack' => ['React Native', 'Node.js', 'PostgreSQL'],
                'metrics' => ['mrr' => 780, 'users' => 3900, 'founded' => '2024', 'profit' => 480],
                'included' => ['Full source code', 'Mobile client', 'Setup documentation'],
                'faq' => null,
                'images' => ['placeholders/petpal-1.png', 'placeholders/petpal-2.png'],
                'is_featured' => false,
                'demo_url' => null,
                'repository_url' => 'https://bitbucket.org/acme/petpal',
            ],
            [
                'category' => 'mobile',
                'title' => 'QuizQuest',
                'slug' => 'quizquest',
                'tagline' => 'Gamified learning and quiz app',
                'description' => "QuizQuest turns study material into streak-driven quiz games with leaderboards, in-app purchases and creator-made packs.\n\nDelivered with a Flutter client and a Node.js API.",
                'multiple' => 28,
                'tech_stack' => ['Flutter', 'Node.js', 'PostgreSQL', 'TypeScript'],
                'metrics' => ['mrr' => 2400, 'users' => 7400, 'founded' => '2023', 'profit' => 1550],
                'included' => ['Full source code', 'Mobile client', 'Deployment guide', 'API documentation'],
                'faq' => null,
                'images' => ['placeholders/quizquest-1.png', 'placeholders/quizquest-2.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.quizquest.app',
                'repository_url' => null,
            ],
            [
                'category' => 'mobile',
                'title' => 'ParkPing',
                'slug' => 'parkping',
                'tagline' => 'Find and reserve parking spots',
                'description' => "ParkPing shows real-time parking availability, lets drivers reserve and pay in advance, and gives lot owners a simple management console.\n\nDelivered as a React Native client with a Laravel API.",
                'multiple' => 33,
                'tech_stack' => ['React Native', 'Laravel', 'MySQL', 'Redis'],
                'metrics' => ['mrr' => 6100, 'users' => 5200, 'founded' => '2022', 'profit' => 4000],
                'included' => ['Full source code', 'Mobile client', 'Admin dashboard', '1 year of updates'],
                'faq' => null,
                'images' => ['placeholders/parkping-1.png', 'placeholders/parkping-2.png', 'placeholders/parkping-3.png'],
                'is_featured' => false,
                'demo_url' => 'https://demo.parkping.app',
                'repository_url' => 'https://github.com/acme/parkping',
            ],
            [
                'category' => 'mobile',
                'title' => 'RecipeReel',
                'slug' => 'recipereel',
                'tagline' => 'Short-video recipe and meal planning app',
                'description' => "RecipeReel is a short-video recipe feed with one-tap meal plans, smart grocery lists and a creator monetisation layer. A mature, high-retention app.\n\nShips as a React Native client with a Node.js + GraphQL backend on AWS.",
                'multiple' => 34,
                'tech_stack' => ['React Native', 'Node.js', 'PostgreSQL', 'GraphQL', 'AWS'],
                'metrics' => ['mrr' => 42000, 'users' => 41000, 'founded' => '2019', 'profit' => 28000],
                'included' => ['Full source code', 'Mobile client', 'Admin dashboard', 'API documentation', '1 year of updates'],
                'faq' => [
                    ['q' => 'Is the creator payout system included?', 'a' => 'Yes — the payout ledger is included; the transfer provider is pluggable.'],
                    ['q' => 'Are the app-store accounts included?', 'a' => 'No — you publish under your own developer accounts.'],
                ],
                'images' => ['placeholders/recipereel-1.png', 'placeholders/recipereel-2.png', 'placeholders/recipereel-3.png'],
                'is_featured' => true,
                'demo_url' => 'https://demo.recipereel.app',
                'repository_url' => 'https://github.com/acme/recipereel',
            ],
        ];
    }
}
