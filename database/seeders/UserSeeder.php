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
     * Foto profil dummy: simpan file potoprofildummy.jpg di
     *   storage/app/public/profile-photos/potoprofildummy.jpg
     * kemudian jalankan: php artisan storage:link
     */
    public function run(): void
    {
        $now = now();

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
            'master.pengguna',
            'master.unit-kerja',
            'master.indeks-surat',
        ];

        $modulesCuti = ['cuti'];

        // 1. Super Admin (dibuat pertama sebagai pembuat semua user awal)
        $superAdmin = User::updateOrCreate(
            ['username' => 'superadmin'],
            [
                'name'                => 'Super Admin',
                'email'               => 'superadmin@eoffice.test',
                'password'            => Hash::make('tasik123@'),
                'role'                => User::ROLE_SUPERADMIN,
                'jabatan'             => 'Super Administrator',
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'module_access'       => [],
                'password_changed_at' => $now,
            ]
        );

        // Set created_by Super Admin ke dirinya sendiri
        $superAdmin->update(['created_by' => $superAdmin->id]);

        // 2. User lainnya (created_by = Super Admin)
        $users = [
            [
                'name'                => 'Tata Usaha',
                'username'            => 'tatausaha',
                'email'               => 'tatausaha@eoffice.test',
                'password'            => Hash::make('tatausaha123@'),
                'role'                => User::ROLE_TU,
                'nip'                 => '198507122008012001',
                'jabatan'             => 'Tata Usaha',
                'jenis_kelamin'       => 'P',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => array_merge(
                    ['dashboard'],
                    $modulesMaster,
                    $modulesPersuratan,
                    $modulesPenjadwalan,
                    $modulesCuti
                ),
            ],
            [
                'name'                => 'H. Cecep Nurul Yakin, S.Pd., M.A.P.',
                'username'            => 'bupati',
                'email'               => 'bupati@eoffice.test',
                'password'            => Hash::make('bupati123@'),
                'role'                => User::ROLE_PIMPINAN,
                'nip'                 => '196806151993031005',
                'jabatan'             => 'Bupati',
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => array_merge(
                    $modulesPersuratan,
                    $modulesPenjadwalan
                ),
            ],
            [
                'name'                => 'H. Asep Sopari Al-Ayubi S.P., M.I.P.',
                'username'            => 'wakilbupati',
                'email'               => 'wakilbupati@eoffice.test',
                'password'            => Hash::make('wakilbupati123@'),
                'role'                => User::ROLE_PIMPINAN,
                'nip'                 => '197203261996031008',
                'jabatan'             => 'Wakil Bupati',
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => array_merge(
                    $modulesPersuratan,
                    $modulesPenjadwalan
                ),
            ],
            [
                'name'                => 'Drs. H. Roni Ahmad Sahroni, MM.',
                'username'            => 'sekda',
                'email'               => 'sekda@eoffice.test',
                'password'            => Hash::make('sekda123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => '196901151990031001',
                'jabatan'             => 'Sekretaris Daerah',
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Asda 1',
                'username'            => 'asda1',
                'email'               => 'asda1@eoffice.test',
                'password'            => Hash::make('asda1123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => '197004151995031002',
                'jabatan'             => 'Asisten Daerah 1',
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Asda 2',
                'username'            => 'asda2',
                'email'               => 'asda2@eoffice.test',
                'password'            => Hash::make('asda2123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => '197105261996031003',
                'jabatan'             => 'Asisten Daerah 2',
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Asda 3',
                'username'            => 'asda3',
                'email'               => 'asda3@eoffice.test',
                'password'            => Hash::make('asda3123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => '197206072000031004',
                'jabatan'             => 'Asisten Daerah 3',
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['username' => $userData['username']],
                $userData
            );
        }

        $this->command->info('Berhasil membuat/memperbarui ' . (count($users) + 1) . ' user.');
        $this->command->info('Login default: superadmin / tasik123@');
        $this->command->info('Foto profil: letakkan potoprofildummy.jpg di storage/app/public/profile-photos/');
    }
}
