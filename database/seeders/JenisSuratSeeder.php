<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JenisSuratSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jenisSurat = [
            'Instruksi',
            'Surat Edaran',
            'Surat Kuasa',
            'Berita Acara',
            'Surat Keterangan',
            'Surat Pengantar',
            'Pengumuman',
            'Laporan',
            'Telaahan Staf',
            'Notula',
            'Surat Undangan',
            'Surat Pernyataan Melaksanakan Tugas',
            'Surat Panggilan',
            'Surat Izin',
            'Lembaran Daerah',
            'Berita Daerah',
            'Rekomendasi',
            'Radiogram',
            'Surat Tanda Tamat Pendidikan dan Pelatihan',
            'Sertifikat',
            'Piagam',
            'Surat Perjanjian',
        ];

        foreach ($jenisSurat as $nama) {
            \App\Models\JenisSurat::firstOrCreate(['nama' => $nama]);
        }
    }
}
