<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title(fake()->unique()->words(fake()->numberBetween(2, 3), true));

        $techPool = [
            'Laravel', 'Next.js', 'React', 'Vue', 'Nuxt', 'MySQL', 'PostgreSQL', 'Redis',
            'Tailwind CSS', 'TypeScript', 'Node.js', 'Redis', 'OpenAI', 'Docker', 'AWS',
            'Inertia', 'Livewire', 'Flutter', 'React Native', 'GraphQL',
        ];
        $includedPool = [
            'Full source code', 'Deployment guide', '30-day support', 'License key',
            '1 year of updates', 'Setup documentation', 'Figma design files', 'Database schema',
            'Admin dashboard', 'API documentation',
        ];

        return [
            'category_id' => Category::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'tagline' => Str::ucfirst(fake()->words(fake()->numberBetween(5, 8), true)),
            'description' => fake()->paragraphs(fake()->numberBetween(2, 4), true),
            'price_cents' => fake()->numberBetween(90000, 2500000), // $900 – $25,000
            'currency' => 'USD',
            'status' => Product::STATUS_DRAFT,
            'demo_url' => null,
            'repository_url' => null,
            'images' => collect(range(1, fake()->numberBetween(2, 4)))
                ->map(fn (int $i) => "placeholders/{$this->productImageSlug($title)}-{$i}.png")
                ->all(),
            'tech_stack' => fake()->randomElements($techPool, fake()->numberBetween(3, 6)),
            'metrics' => [
                'mrr' => fake()->numberBetween(500, 50000),
                'users' => fake()->numberBetween(50, 20000),
                'founded' => (string) fake()->numberBetween(2018, 2025),
                'profit' => fake()->numberBetween(0, 30000),
            ],
            'included' => fake()->randomElements($includedPool, fake()->numberBetween(3, 5)),
            'faq' => fake()->boolean(70) ? $this->fakeFaq() : null,
            'deliverable_path' => null,
            'is_featured' => false,
            'published_at' => null,
        ];
    }

    /**
     * A published listing: visible in the public catalog with a stamped published_at.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Product::STATUS_PUBLISHED,
            // Explicit UTC-relative datetime (via now(), the app-timezone Carbon) rather than
            // fake()->dateTimeBetween (which uses PHP's date.timezone) — keeps ordering
            // deterministic across engines, e.g. MariaDB 10.4 with second-only DATETIME.
            'published_at' => now()->subDays(fake()->numberBetween(1, 365)),
        ]);
    }

    /**
     * Surface on the home hero / featured strip.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Attach a Live Demo link (plain HTTPS URL). Pass an explicit URL to control the host.
     */
    public function withDemo(?string $url = null): static
    {
        return $this->state(fn (array $attributes) => [
            'demo_url' => $url ?? 'https://'.fake()->domainWord().'.example.com',
        ]);
    }

    /**
     * Attach a View Repository link (plain HTTPS URL). Pass an explicit URL to control the host
     * (github.com / gitlab.com / bitbucket.org / self-hosted) — see 16_Product_Flow.md.
     */
    public function withRepository(?string $url = null): static
    {
        return $this->state(fn (array $attributes) => [
            'repository_url' => $url ?? 'https://github.com/'.fake()->userName().'/'.fake()->slug(2),
        ]);
    }

    /**
     * Build a small, believable FAQ array.
     *
     * @return array<int, array{q: string, a: string}>
     */
    protected function fakeFaq(): array
    {
        return collect(range(1, fake()->numberBetween(2, 4)))
            ->map(fn () => [
                'q' => Str::finish(fake()->sentence(fake()->numberBetween(4, 8)), '?'),
                'a' => fake()->sentence(fake()->numberBetween(8, 16)),
            ])
            ->all();
    }

    /**
     * Slugify a title for use inside placeholder image filenames.
     */
    protected function productImageSlug(string $title): string
    {
        return Str::slug($title);
    }
}
