<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Membuat user awal untuk testing dan first login.
     */
    /**
     * Run the database seeds.
     * 
     * Membuat user awal untuk testing dan first login.
     */
    public function run(): void
    {
        // Define Module Access Groups
        $modulesPenjadwalan = [
            'dashboard',
            'penjadwalan.jadwal',
            'penjadwalan.tentatif',
            'penjadwalan.definitif',
        ];

        $modulesPersuratan = [
            'dashboard',
            'persuratan.surat-masuk',
            'persuratan.surat-keluar',
        ];

        $modulesMaster = [
            'master.kepegawaian',
            'master.pengguna',
            'master.unit-kerja',
            'master.indeks-surat',
        ];

        $modulesCuti = ['cuti'];

        // 1. Super Admin (Access All by Role Logic)
        $users = [
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'email' => 'superadmin@eoffice.test',
                'password' => Hash::make('tasik123@'),
                'role' => User::ROLE_SUPERADMIN,
                'module_access' => [], // Superadmin has all access
            ],
            // 4. Tata Usaha (Master, Persuratan, Penjadwalan, Cuti, Pengaturan)
            [
                'name' => 'Tata Usaha',
                'username' => 'tatausaha',
                'email' => 'tatausaha@eoffice.test',
                'password' => Hash::make('tatausaha123@'),
                'role' => User::ROLE_TU,
                'jabatan' => 'Tata Usaha',
                'module_access' => array_merge(
                    ['dashboard'],
                    $modulesMaster,
                    $modulesPersuratan,
                    $modulesPenjadwalan,
                    $modulesCuti
                ),
            ],
            // 2. Pimpinan (Persuratan read-only + Penjadwalan)
            [
                'name' => 'Bupati',
                'username' => 'bupati',
                'email' => 'bupati@eoffice.test',
                'password' => Hash::make('bupati123@'),
                'role' => User::ROLE_PIMPINAN,
                'jabatan' => 'Bupati',
                'module_access' => array_merge(
                    $modulesPersuratan,
                    $modulesPenjadwalan
                ),
            ],
            [
                'name' => 'Wakil Bupati',
                'username' => 'wakilbupati',
                'email' => 'wakilbupati@eoffice.test',
                'password' => Hash::make('wakilbupati123@'),
                'role' => User::ROLE_PIMPINAN,
                'jabatan' => 'Wakil Bupati',
                'module_access' => array_merge(
                    $modulesPersuratan,
                    $modulesPenjadwalan
                ),
            ],
            // 5. User (Persuratan, Pengaturan)
            [
                'name' => 'Sekda',
                'username' => 'sekda',
                'email' => 'sekda@eoffice.test',
                'password' => Hash::make('sekda123@'),
                'role' => User::ROLE_USER,
                'jabatan' => 'Sekretaris Daerah',
                'module_access' => $modulesPersuratan,
            ],
            [
                'name' => 'Asda 1',
                'username' => 'asda1',
                'email' => 'asda1@eoffice.test',
                'password' => Hash::make('asda1123@'),
                'role' => User::ROLE_USER,
                'jabatan' => 'Asisten Daerah 1',
                'module_access' => $modulesPersuratan,
            ],
            [
                'name' => 'Asda 2',
                'username' => 'asda2',
                'email' => 'asda2@eoffice.test',
                'password' => Hash::make('asda2123@'),
                'role' => User::ROLE_USER,
                'jabatan' => 'Asisten Daerah 2',
                'module_access' => $modulesPersuratan,
            ],
            [
                'name' => 'Asda 3',
                'username' => 'asda3',
                'email' => 'asda3@eoffice.test',
                'password' => Hash::make('asda3123@'),
                'role' => User::ROLE_USER,
                'jabatan' => 'Asisten Daerah 3',
                'module_access' => $modulesPersuratan,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['username' => $userData['username']],
                $userData
            );
        }

        $this->command->info('Created/updated ' . count($users) . ' users.');
        $this->command->info('Default login: superadmin / tasik123@');
    }
}
