<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('Tidak ada user. Silakan jalankan UserSeeder terlebih dahulu.');
            return;
        }

        $actions = [
            ActivityLog::ACTION_LOGIN,
            ActivityLog::ACTION_LOGOUT,
            ActivityLog::ACTION_CREATE,
            ActivityLog::ACTION_UPDATE,
            ActivityLog::ACTION_DELETE,
        ];

        $browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
        $platforms = ['Windows', 'macOS', 'Linux', 'Android', 'iOS'];
        $ips = [
            '192.168.1.1',
            '10.0.0.25',
            '172.16.0.100',
            '103.23.145.67',
            '36.75.123.45',
        ];

        $modelTypes = [
            'App\\Models\\User',
            'App\\Models\\SuratMasuk',
            'App\\Models\\SuratKeluar',
            'App\\Models\\UnitKerja',
            'App\\Models\\IndeksSurat',
        ];

        $descriptions = [
            ActivityLog::ACTION_LOGIN => [
                'Pengguna %s berhasil login',
            ],
            ActivityLog::ACTION_LOGOUT => [
                'Pengguna %s logout dari sistem',
            ],
            ActivityLog::ACTION_CREATE => [
                'Membuat data %s baru',
                'Menambahkan %s ke database',
            ],
            ActivityLog::ACTION_UPDATE => [
                'Mengupdate data %s',
                'Melakukan perubahan pada %s',
            ],
            ActivityLog::ACTION_DELETE => [
                'Menghapus data %s',
                'Memindahkan %s ke archive',
            ],
        ];

        $baseDate = Carbon::now()->subDays(30);

        // Generate 50 random activity logs
        for ($i = 0; $i < 50; $i++) {
            $user = $users->random();
            $action = $actions[array_rand($actions)];
            $browser = $browsers[array_rand($browsers)];
            $platform = $platforms[array_rand($platforms)];
            $ip = $ips[array_rand($ips)];
            $createdAt = $baseDate->copy()->addHours(rand(1, 720));

            // Generate description
            $descTemplates = $descriptions[$action];
            $descTemplate = $descTemplates[array_rand($descTemplates)];

            if (in_array($action, [ActivityLog::ACTION_LOGIN, ActivityLog::ACTION_LOGOUT])) {
                $description = sprintf($descTemplate, $user->name);
                $modelType = 'App\\Models\\User';
                $modelId = $user->id;
            } else {
                $modelType = $modelTypes[array_rand($modelTypes)];
                $modelName = class_basename($modelType);
                $description = sprintf($descTemplate, $modelName);
                $modelId = rand(1, 100);
            }

            // Generate user agent
            $userAgent = "Mozilla/5.0 ({$platform}) {$browser}/120.0";

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => (string) $modelId,
                'description' => $description,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'properties' => in_array($action, [ActivityLog::ACTION_UPDATE]) ? [
                    'old' => ['field' => 'old_value'],
                    'new' => ['field' => 'new_value'],
                ] : null,
                'created_at' => $createdAt,
            ]);
        }

        $this->command->info('50 data Activity Log berhasil dibuat.');
    }
}
