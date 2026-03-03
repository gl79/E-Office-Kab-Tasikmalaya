<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Membuat user awal untuk testing dan first login.
     * Setiap user diasosiasikan ke jabatan struktural via jabatan_id.
     * Foto profil dummy: simpan file potoprofildummy.jpg di
     *   storage/app/public/profile-photos/potoprofildummy.jpg
     * kemudian jalankan: php artisan storage:link
     */
    public function run(): void
    {
        $now = now();

        // Ambil jabatan IDs
        $jabatanIds = Jabatan::pluck('id', 'nama');

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
            'master.jabatans',
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
                'nip'                 => null,
                'jabatan_id'          => null, // SuperAdmin tidak punya jabatan
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
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Staf'] ?? null,
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
                'name'                => 'Bupati',
                'username'            => 'bupati',
                'email'               => 'bupati@eoffice.test',
                'password'            => Hash::make('bupati123@'),
                'role'                => User::ROLE_PEJABAT,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Bupati'] ?? null,
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
                'name'                => 'Wakil Bupati',
                'username'            => 'wakilbupati',
                'email'               => 'wakilbupati@eoffice.test',
                'password'            => Hash::make('wakilbupati123@'),
                'role'                => User::ROLE_PEJABAT,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Wakil Bupati'] ?? null,
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
                'name'                => 'Sekretaris Daerah',
                'username'            => 'sekda',
                'email'               => 'sekda@eoffice.test',
                'password'            => Hash::make('sekda123@'),
                'role'                => User::ROLE_PEJABAT,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Sekretaris Daerah'] ?? null,
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
                'role'                => User::ROLE_PEJABAT,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Asisten Daerah I'] ?? null,
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
                'role'                => User::ROLE_PEJABAT,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Asisten Daerah II'] ?? null,
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
                'role'                => User::ROLE_PEJABAT,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Asisten Daerah III'] ?? null,
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            // === Kabag (Kepala Bagian) ===
            [
                'name'                => 'Kabag Kesejahteraan Rakyat',
                'username'            => 'kabagkesra',
                'email'               => 'kabagkesra@eoffice.test',
                'password'            => Hash::make('kabagkesra123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Kepala Bagian'] ?? null,
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Kabag Organisasi',
                'username'            => 'kabagorganisasi',
                'email'               => 'kabagorganisasi@eoffice.test',
                'password'            => Hash::make('kabagorganisasi123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Kepala Bagian'] ?? null,
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Kabag Umum',
                'username'            => 'kabagumum',
                'email'               => 'kabagumum@eoffice.test',
                'password'            => Hash::make('kabagumum123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Kepala Bagian'] ?? null,
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Kabag Hukum',
                'username'            => 'kabaghukum',
                'email'               => 'kabaghukum@eoffice.test',
                'password'            => Hash::make('kabaghukum123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Kepala Bagian'] ?? null,
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Kabag Ekonomi Pembangunan',
                'username'            => 'kabagekbang',
                'email'               => 'kabagekbang@eoffice.test',
                'password'            => Hash::make('kabagekbang123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Kepala Bagian'] ?? null,
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Kabag Barang & Jasa',
                'username'            => 'kabagbarjas',
                'email'               => 'kabagbarjas@eoffice.test',
                'password'            => Hash::make('kabagbarjas123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Kepala Bagian'] ?? null,
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Kabag Tata Pemerintahan',
                'username'            => 'kabagtapem',
                'email'               => 'kabagtapem@eoffice.test',
                'password'            => Hash::make('kabagtapem123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Kepala Bagian'] ?? null,
                'jenis_kelamin'       => 'L',
                'foto'                => 'profile-photos/potoprofildummy.jpg',
                'created_by'          => $superAdmin->id,
                'password_changed_at' => $now,
                'module_access'       => $modulesPersuratan,
            ],
            [
                'name'                => 'Kabag Prokompim',
                'username'            => 'kabagprokompim',
                'email'               => 'kabagprokompim@eoffice.test',
                'password'            => Hash::make('kabagprokompim123@'),
                'role'                => User::ROLE_USER,
                'nip'                 => null,
                'jabatan_id'          => $jabatanIds['Kepala Bagian'] ?? null,
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
    }
}
