<?php

namespace Database\Seeders;

use App\Models\WilayahDesa;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use Illuminate\Database\Seeder;

class WilayahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Provinsi Jawa Barat
        $jabar = WilayahProvinsi::create([
            'kode' => '32',
            'nama' => 'JAWA BARAT',
        ]);

        // 2. Kabupaten Tasikmalaya
        $tasik = WilayahKabupaten::create([
            'provinsi_kode' => $jabar->kode,
            'kode' => '06',
            'nama' => 'KABUPATEN TASIKMALAYA',
        ]);

        // 3. Kecamatan (Sample 3 kecamatan)
        $kecamatans = [
            ['kode' => '01', 'nama' => 'CIPATUJAH'],
            ['kode' => '02', 'nama' => 'KARANGNUNGGAL'],
            ['kode' => '03', 'nama' => 'CIKALONG'],
        ];

        foreach ($kecamatans as $kec) {
            $kecamatan = WilayahKecamatan::create([
                'provinsi_kode' => $tasik->provinsi_kode,
                'kabupaten_kode' => $tasik->kode,
                'kode' => $kec['kode'],
                'nama' => $kec['nama'],
            ]);

            // 4. Desa (Sample 3 desa per kecamatan)
            for ($i = 1; $i <= 3; $i++) {
                WilayahDesa::create([
                    'provinsi_kode' => $kecamatan->provinsi_kode,
                    'kabupaten_kode' => $kecamatan->kabupaten_kode,
                    'kecamatan_kode' => $kecamatan->kode,
                    'kode' => '200' . $i,
                    'nama' => "DESA CONTOH {$kec['nama']} {$i}",
                ]);
            }
        }
    }
}
