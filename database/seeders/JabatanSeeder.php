<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Membuat jabatan struktural default sesuai hierarchy Kab. Tasikmalaya.
     * Level: semakin kecil = semakin tinggi.
     */
    public function run(): void
    {
        $jabatans = [
            ['nama' => 'Bupati',              'level' => 1, 'can_dispose' => true,  'is_system' => true],
            ['nama' => 'Wakil Bupati',        'level' => 2, 'can_dispose' => true,  'is_system' => true],
            ['nama' => 'Sekretaris Daerah',   'level' => 3, 'can_dispose' => true,  'is_system' => true],
            ['nama' => 'Asisten Daerah I',    'level' => 4, 'can_dispose' => true,  'is_system' => false],
            ['nama' => 'Asisten Daerah II',   'level' => 4, 'can_dispose' => true,  'is_system' => false],
            ['nama' => 'Asisten Daerah III',  'level' => 4, 'can_dispose' => true,  'is_system' => false],
            ['nama' => 'Staff Ahli I',        'level' => 5, 'can_dispose' => true,  'is_system' => false],
            ['nama' => 'Staff Ahli II',       'level' => 5, 'can_dispose' => true,  'is_system' => false],
            ['nama' => 'Staff Ahli III',      'level' => 5, 'can_dispose' => true,  'is_system' => false],
            ['nama' => 'Kepala Dinas',        'level' => 6, 'can_dispose' => false, 'is_system' => false],
            ['nama' => 'Kepala Bagian',       'level' => 7, 'can_dispose' => false, 'is_system' => false],
            ['nama' => 'Tata Usaha',          'level' => 8, 'can_dispose' => false, 'is_system' => true],
        ];

        foreach ($jabatans as $jabatan) {
            Jabatan::updateOrCreate(
                ['nama' => $jabatan['nama']],
                $jabatan
            );
        }

        $this->command->info('Berhasil membuat/memperbarui ' . count($jabatans) . ' jabatan struktural.');
    }
}
