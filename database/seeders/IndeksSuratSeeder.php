<?php

namespace Database\Seeders;

use App\Models\IndeksSurat;
use Illuminate\Database\Seeder;

class IndeksSuratSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $indexes = [
            [
                'kode' => '000',
                'nama' => 'Umum',
                'jenis_surat' => IndeksSurat::JENIS_PEMBERIAN_BANTUAN,
            ],
            [
                'kode' => '100',
                'nama' => 'Pemerintahan',
                'jenis_surat' => IndeksSurat::JENIS_PENANDATANGANAN,
            ],
            [
                'kode' => '200',
                'nama' => 'Politik',
                'jenis_surat' => IndeksSurat::JENIS_AUDIENSI,
            ],
            [
                'kode' => '300',
                'nama' => 'Keamanan dan Ketertiban',
                'jenis_surat' => IndeksSurat::JENIS_SURAT_TUGAS,
            ],
            [
                'kode' => '400',
                'nama' => 'Kesejahteraan Rakyat',
                'jenis_surat' => IndeksSurat::JENIS_PEMBERIAN_BANTUAN,
            ],
            [
                'kode' => '500',
                'nama' => 'Perekonomian',
                'jenis_surat' => IndeksSurat::JENIS_PENANDATANGANAN,
            ],
            [
                'kode' => '600',
                'nama' => 'Pekerjaan Umum dan Ketenagaan',
                'jenis_surat' => IndeksSurat::JENIS_SURAT_TUGAS,
            ],
            [
                'kode' => '700',
                'nama' => 'Pengawasan',
                'jenis_surat' => IndeksSurat::JENIS_AUDIENSI,
            ],
            [
                'kode' => '800',
                'nama' => 'Kepegawaian',
                'jenis_surat' => IndeksSurat::JENIS_PENANDATANGANAN,
            ],
            [
                'kode' => '900',
                'nama' => 'Keuangan',
                'jenis_surat' => IndeksSurat::JENIS_PEMBERIAN_BANTUAN,
            ],
        ];

        foreach ($indexes as $index) {
            IndeksSurat::firstOrCreate(['kode' => $index['kode']], $index);
        }

        $this->command->info('10 data Indeks Surat berhasil dibuat.');
    }
}
