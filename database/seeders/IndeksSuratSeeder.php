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
        // Level 1: Kode Primer
        $primers = [
            ['kode' => '000', 'nama' => 'Umum', 'level' => 1, 'urutan' => 1],
            ['kode' => '100', 'nama' => 'Pemerintahan', 'level' => 1, 'urutan' => 2],
            ['kode' => '200', 'nama' => 'Politik', 'level' => 1, 'urutan' => 3],
            ['kode' => '300', 'nama' => 'Keamanan dan Ketertiban', 'level' => 1, 'urutan' => 4],
            ['kode' => '400', 'nama' => 'Kesejahteraan Rakyat', 'level' => 1, 'urutan' => 5],
            ['kode' => '500', 'nama' => 'Perekonomian', 'level' => 1, 'urutan' => 6],
            ['kode' => '600', 'nama' => 'Pekerjaan Umum dan Ketenagaan', 'level' => 1, 'urutan' => 7],
            ['kode' => '700', 'nama' => 'Pengawasan', 'level' => 1, 'urutan' => 8],
            ['kode' => '800', 'nama' => 'Kepegawaian', 'level' => 1, 'urutan' => 9],
            ['kode' => '900', 'nama' => 'Keuangan', 'level' => 1, 'urutan' => 10],
        ];

        $primerModels = [];
        foreach ($primers as $primer) {
            $primerModels[$primer['kode']] = IndeksSurat::firstOrCreate(
                ['kode' => $primer['kode']],
                $primer
            );
        }

        $this->command->info('10 data Indeks Surat (Kode Primer) berhasil dibuat.');

        // Level 2: Sub Primer
        $subPrimers = [
            // A. Umum (000)
            '000' => [
                ['kode' => '000.1', 'nama' => 'Ketatausahaan Dan Kerumahtanggaan'],
                ['kode' => '000.2', 'nama' => 'Perlengkapan'],
                ['kode' => '000.3', 'nama' => 'Pengadaan'],
                ['kode' => '000.4', 'nama' => 'Perpustakaan'],
                ['kode' => '000.5', 'nama' => 'Kearsipan'],
                ['kode' => '000.6', 'nama' => 'Persandian'],
                ['kode' => '000.7', 'nama' => 'Perencanaan Pembangunan'],
                ['kode' => '000.8', 'nama' => 'Organisasi Dan Tata Laksana'],
                ['kode' => '000.9', 'nama' => 'Penelitian, Pengkajian, Dan Pengembangan'],
            ],
            // B. Pemerintahan (100)
            '100' => [
                ['kode' => '100.1', 'nama' => 'Otonomi Daerah'],
                ['kode' => '100.2', 'nama' => 'Pemerintahan Umum'],
                ['kode' => '100.3', 'nama' => 'Hukum'],
            ],
            // C. Politik (200)
            '200' => [
                ['kode' => '200.1', 'nama' => 'Kesatuan Bangsa Dan Politik'],
                ['kode' => '200.2', 'nama' => 'Pemilu'],
            ],
            // D. Keamanan dan Ketertiban (300)
            '300' => [
                ['kode' => '300.1', 'nama' => 'Satuan Polisi Pamong Praja'],
                ['kode' => '300.2', 'nama' => 'Penanggulangan Bencana, Pencarian, Dan Pertolongan'],
            ],
            // E. Kesejahteraan Rakyat (400)
            '400' => [
                ['kode' => '400.1', 'nama' => 'Pembangunan Daerah Tertinggal'],
                ['kode' => '400.2', 'nama' => 'Pemberdayaan Perempuan Dan Perlindungan Anak'],
                ['kode' => '400.3', 'nama' => 'Pendidikan'],
                ['kode' => '400.4', 'nama' => 'Keolahragaan'],
                ['kode' => '400.5', 'nama' => 'Kepemudaan'],
                ['kode' => '400.6', 'nama' => 'Kebudayaan'],
                ['kode' => '400.7', 'nama' => 'Kesehatan'],
                ['kode' => '400.8', 'nama' => 'Agama Dan Kepercayaan'],
                ['kode' => '400.9', 'nama' => 'Sosial'],
                ['kode' => '400.10', 'nama' => 'Pemberdayaan Masyarakat Desa'],
                ['kode' => '400.12', 'nama' => 'Kependudukan Dan Catatan Sipil'],
                ['kode' => '400.13', 'nama' => 'Keluarga Berencana'],
                ['kode' => '400.14', 'nama' => 'Hubungan Masyarakat'],
            ],
            // F. Perekonomian (500)
            '500' => [
                ['kode' => '500.1', 'nama' => 'Ketahanan Pangan'],
                ['kode' => '500.2', 'nama' => 'Perdagangan'],
                ['kode' => '500.3', 'nama' => 'Koperasi Dan Usaha Kecil Menengah'],
                ['kode' => '500.4', 'nama' => 'Kehutanan'],
                ['kode' => '500.5', 'nama' => 'Kelautan Dan Perikanan'],
                ['kode' => '500.6', 'nama' => 'Pertanian'],
                ['kode' => '500.7', 'nama' => 'Peternakan'],
                ['kode' => '500.8', 'nama' => 'Perkebunan'],
                ['kode' => '500.9', 'nama' => 'Perindustrian'],
                ['kode' => '500.10', 'nama' => 'Energi Dan Sumber Daya Mineral'],
                ['kode' => '500.11', 'nama' => 'Perhubungan'],
                ['kode' => '500.12', 'nama' => 'Komunikasi Dan Informatika'],
                ['kode' => '500.13', 'nama' => 'Pariwisata Dan Ekonomi Kreatif'],
                ['kode' => '500.14', 'nama' => 'Statistik'],
                ['kode' => '500.15', 'nama' => 'Ketenagakerjaan'],
                ['kode' => '500.16', 'nama' => 'Penanaman Modal'],
                ['kode' => '500.17', 'nama' => 'Pertanahan'],
                ['kode' => '500.18', 'nama' => 'Transmigrasi'],
            ],
            // G. Pekerjaan Umum dan Ketenagaan (600)
            '600' => [
                ['kode' => '600.1', 'nama' => 'Pekerjaan Umum'],
                ['kode' => '600.2', 'nama' => 'Perumahan Rakyat Dan Kawasan Pemukiman'],
                ['kode' => '600.3', 'nama' => 'Tata Ruang (Tata Kota)'],
                ['kode' => '600.4', 'nama' => 'Lingkungan Hidup'],
            ],
            // H. Pengawasan (700)
            '700' => [
                ['kode' => '700.1', 'nama' => 'Pengawasan Internal'],
            ],
            // I. Kepegawaian (800)
            '800' => [
                ['kode' => '800.1', 'nama' => 'Sumber Daya Manusia'],
                ['kode' => '800.2', 'nama' => 'Pendidikan Dan Pelatihan'],
            ],
            // J. Keuangan (900)
            '900' => [
                ['kode' => '900.1', 'nama' => 'Keuangan Daerah'],
            ],
        ];

        $subCount = 0;
        foreach ($subPrimers as $parentKode => $children) {
            $parent = $primerModels[$parentKode];

            foreach ($children as $child) {
                IndeksSurat::firstOrCreate(
                    ['kode' => $child['kode']],
                    [
                        'kode' => $child['kode'],
                        'nama' => $child['nama'],
                        'parent_id' => $parent->id,
                        'level' => 2,
                    ]
                );
                $subCount++;
            }
        }

        $this->command->info("{$subCount} data Indeks Surat (Sub Primer) berhasil dibuat.");
    }
}
