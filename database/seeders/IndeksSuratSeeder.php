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
        ];

        foreach ($indexes as $index) {
            IndeksSurat::create($index);
        }
    }
}
