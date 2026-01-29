<?php

namespace Database\Seeders;

use App\Models\UnitKerja;
use Illuminate\Database\Seeder;

class UnitKerjaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            [
                'nama' => 'Dinas Pekerjaan Umum dan Penataan Ruang',
                'singkatan' => 'DPUPR',
            ],
            [
                'nama' => 'Sekretariat Daerah',
                'singkatan' => 'SETDA',
            ],
            [
                'nama' => 'Dinas Kesehatan',
                'singkatan' => 'DINKES',
            ],
            [
                'nama' => 'Dinas Pendidikan',
                'singkatan' => 'DISDIK',
            ],
            [
                'nama' => 'Badan Perencanaan Pembangunan Daerah',
                'singkatan' => 'BAPPEDA',
            ],
        ];

        foreach ($units as $unit) {
            UnitKerja::firstOrCreate(['singkatan' => $unit['singkatan']], $unit);
        }
    }
}
