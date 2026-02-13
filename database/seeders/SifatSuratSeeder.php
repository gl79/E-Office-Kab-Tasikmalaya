<?php

namespace Database\Seeders;

use App\Models\SifatSurat;
use Illuminate\Database\Seeder;

class SifatSuratSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'Biasa',
            'Terbatas',
            'Rahasia',
            'Sangat Rahasia',
        ];

        foreach ($data as $nama) {
            SifatSurat::firstOrCreate(['nama' => $nama]);
        }
    }
}
