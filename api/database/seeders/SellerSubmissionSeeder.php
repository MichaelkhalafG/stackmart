<?php

namespace Database\Seeders;

use App\Models\SellerSubmission;
use Illuminate\Database\Seeder;

class SellerSubmissionSeeder extends Seeder
{
    /**
     * A handful of submissions spanning the review lifecycle (new → in_review → approved)
     * so the admin review queue and its status filter/actions have realistic data to work
     * through. Idempotent via (email, project_name). `admin_notes` is set on reviewed rows.
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
                'status' => SellerSubmission::STATUS_IN_REVIEW,
                'admin_notes' => 'Solid MRR and clean codebase — waiting on the seller to confirm the deployment docs are complete.',
            ],
            [
                'name' => 'Priya Raman',
                'email' => 'priya@leadloop.io',
                'project_name' => 'LeadLoop',
                'url' => 'https://leadloop.io',
                'asking_price_cents' => 1600000,
                'mrr_cents' => 0,
                'description' => 'A pre-revenue outbound-sales CRM built on Next.js. Full source, no customers yet.',
                'status' => SellerSubmission::STATUS_NEW,
                'admin_notes' => null,
            ],
            [
                'name' => 'Marcus Feld',
                'email' => 'marcus@quicktill.app',
                'project_name' => 'QuickTill',
                'url' => 'https://quicktill.app',
                'asking_price_cents' => 640000,
                'mrr_cents' => 95000,
                'description' => 'A lightweight point-of-sale for cafes. Flutter client + Laravel API, 120 active venues.',
                'status' => SellerSubmission::STATUS_APPROVED,
                'admin_notes' => 'Approved — vetted repo access and demo. Ready to publish as a listing.',
            ],
        ];

        foreach ($submissions as $submission) {
            SellerSubmission::updateOrCreate(
                ['email' => $submission['email'], 'project_name' => $submission['project_name']],
                $submission,
            );
        }
    }
}
