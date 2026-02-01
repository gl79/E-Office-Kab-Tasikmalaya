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
                'urutan' => 1,
            ],
            [
                'kode' => '100',
                'nama' => 'Pemerintahan',
                'urutan' => 2,
            ],
            [
                'kode' => '200',
                'nama' => 'Politik',
                'urutan' => 3,
            ],
            [
                'kode' => '300',
                'nama' => 'Keamanan dan Ketertiban',
                'urutan' => 4,
            ],
            [
                'kode' => '400',
                'nama' => 'Kesejahteraan Rakyat',
                'urutan' => 5,
            ],
            [
                'kode' => '500',
                'nama' => 'Perekonomian',
                'urutan' => 6,
            ],
            [
                'kode' => '600',
                'nama' => 'Pekerjaan Umum dan Ketenagakerjaan',
                'urutan' => 7,
            ],
            [
                'kode' => '700',
                'nama' => 'Pengawasan',
                'urutan' => 8,
            ],
            [
                'kode' => '800',
                'nama' => 'Kepegawaian',
                'urutan' => 9,
            ],
            [
                'kode' => '900',
                'nama' => 'Keuangan',
                'urutan' => 10,
            ],
        ];

        foreach ($indexes as $index) {
            IndeksSurat::firstOrCreate(['kode' => $index['kode']], $index);
        }

        $this->command->info('10 data Indeks Surat berhasil dibuat.');
    }
}
