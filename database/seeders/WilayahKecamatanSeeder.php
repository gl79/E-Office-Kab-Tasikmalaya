<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WilayahKecamatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing data
        DB::table('wilayah_kecamatan')->delete();

        $data = [
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '01', 'nama' => 'Cipatujah'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '02', 'nama' => 'Karangnunggal'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '03', 'nama' => 'Cikalong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '04', 'nama' => 'Pancatengah'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '05', 'nama' => 'Cikatomas'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '06', 'nama' => 'Cibalong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '07', 'nama' => 'Parungponteng'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '08', 'nama' => 'Bantarkalong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '09', 'nama' => 'Bojongasih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '10', 'nama' => 'Culamega'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '11', 'nama' => 'Bojonggambir'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '12', 'nama' => 'Sodonghilir'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '13', 'nama' => 'Taraju'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '14', 'nama' => 'Salawu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '15', 'nama' => 'Puspahiang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '16', 'nama' => 'Tanjungjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '17', 'nama' => 'Sukaraja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '18', 'nama' => 'Salopa'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '19', 'nama' => 'Jatiwaras'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '20', 'nama' => 'Cineam'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '21', 'nama' => 'Karang Jaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '22', 'nama' => 'Manonjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '23', 'nama' => 'Gunung Tanjung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '24', 'nama' => 'Singaparna'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '25', 'nama' => 'Mangunreja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '26', 'nama' => 'Sukarame'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '27', 'nama' => 'Cigalontang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '28', 'nama' => 'Leuwisari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '29', 'nama' => 'Padakembang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '30', 'nama' => 'Sariwangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '31', 'nama' => 'Sukaratu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '32', 'nama' => 'Cisayong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '33', 'nama' => 'Sukahening'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '34', 'nama' => 'Rajapolah'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '35', 'nama' => 'Jamanis'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '36', 'nama' => 'Ciawi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '37', 'nama' => 'Kadipaten'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '38', 'nama' => 'Pagerageung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '39', 'nama' => 'Sukaresik'],
        ];

        // Add timestamps
        $now = now();
        $data = array_map(function ($item) use ($now) {
            return array_merge($item, [
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }, $data);

        DB::table('wilayah_kecamatan')->insert($data);
    }
}
