<?php

namespace Database\Seeders;

use App\Models\SellerSubmission;
use Illuminate\Database\Seeder;

class SellerSubmissionSeeder extends Seeder
{
    /**
     * A couple of `new` submissions so the admin review queue has something to work through.
     */
    public function run(): void
    {
        $submissions = [
            [
                'name' => 'Dana Ortega',
                'email' => 'dana@snippetsafe.dev',
                'project_name' => 'SnippetSafe',
                'url' => 'https://snippetsafe.dev',
                'asking_price_cents' => 850000,
                'mrr_cents' => 210000,
                'description' => 'A team snippet manager with search and role-based sharing. Laravel + Vue, 40 paying teams.',
            ],
            [
                'name' => 'Priya Raman',
                'email' => 'priya@leadloop.io',
                'project_name' => 'LeadLoop',
                'url' => 'https://leadloop.io',
                'asking_price_cents' => 1600000,
                'mrr_cents' => 0,
                'description' => 'A pre-revenue outbound-sales CRM built on Next.js. Full source, no customers yet.',
            ],
        ];

        foreach ($submissions as $submission) {
            SellerSubmission::updateOrCreate(
                ['email' => $submission['email'], 'project_name' => $submission['project_name']],
                array_merge($submission, ['status' => SellerSubmission::STATUS_NEW]),
            );
        }
    }
}
