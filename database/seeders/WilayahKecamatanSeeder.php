<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WilayahKecamatanSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('wilayah_kecamatan')->delete();

        $data = [
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '01', 'nama' => 'Cipatujah', 'latitude' => -7.7335621, 'longitude' => 108.0194342, 'alamat' => 'Jl. Raya Cipatujah No.16, Cipatujah, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '02', 'nama' => 'Karangnunggal', 'latitude' => -7.6267258, 'longitude' => 108.1344877, 'alamat' => 'Jl. Raya Karangnunggal, Karangnunggal, Kec. Karangnunggal, Kabupaten Tasikmalaya, Jawa Barat 46186'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '03', 'nama' => 'Cikalong', 'latitude' => -7.7629545, 'longitude' => 108.1735974, 'alamat' => 'Jl. Cikalong 55-96, Cikalong, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '04', 'nama' => 'Pancatengah', 'latitude' => -7.6580464, 'longitude' => 108.2719317, 'alamat' => 'Jl. Raya Pancatengha, Cibongas, Kec. Pancatengah, Kabupaten Tasikmalaya, Jawa Barat 46194'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '05', 'nama' => 'Cikatomas', 'latitude' => -7.6227402, 'longitude' => 108.2574982, 'alamat' => 'Pakemitan, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '06', 'nama' => 'Cibalong', 'latitude' => -7.5150245, 'longitude' => 108.1823614, 'alamat' => 'Jl. Raya Karangnunggal No.202, Cibalong, Kec. Cibalong, Kabupaten Tasikmalaya, Jawa Barat 46185'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '07', 'nama' => 'Parungponteng', 'latitude' => -7.4976115, 'longitude' => 108.1521617, 'alamat' => 'Parungponteng, Tasikmalaya, Kabupaten Tasikmalaya, Jawa Barat 46185'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '08', 'nama' => 'Bantarkalong', 'latitude' => -7.6216263, 'longitude' => 108.1097957, 'alamat' => 'Jl. Pemuda, Hegarwangi, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 46187'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '09', 'nama' => 'Bojongasih', 'latitude' => -7.5809196, 'longitude' => 108.1306369, 'alamat' => 'Bojongasih, Kec. Bojongasih, Kabupaten Tasikmalaya, Jawa Barat 46475'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '10', 'nama' => 'Culamega', 'latitude' => -7.6110777, 'longitude' => 108.0513769, 'alamat' => 'Cintabodas, Kec. Culamega, Kabupaten Tasikmalaya, Jawa Barat 46188'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '11', 'nama' => 'Bojonggambir', 'latitude' => -7.5024111, 'longitude' => 107.9655058, 'alamat' => 'Mangkonjaya, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '12', 'nama' => 'Sodonghilir', 'latitude' => -7.4880099, 'longitude' => 108.053071, 'alamat' => 'Sodonghilir, Kec. Sodonghilir, Kabupaten Tasikmalaya, Jawa Barat 46473'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '13', 'nama' => 'Taraju', 'latitude' => -7.4596002, 'longitude' => 107.9823907, 'alamat' => 'Taraju, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '14', 'nama' => 'Salawu', 'latitude' => -7.3735503, 'longitude' => 108.0297041, 'alamat' => 'Jl. Raya Salawu No.95, Karangmukti, Kec. Salawu, Kabupaten Tasikmalaya, Jawa Barat 46471'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '15', 'nama' => 'Puspahiang', 'latitude' => -7.4169905, 'longitude' => 108.047224, 'alamat' => 'Puspahiang, Kec. Puspahiang, Kabupaten Tasikmalaya, Jawa Barat 46471'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '16', 'nama' => 'Tanjungjaya', 'latitude' => -7.3892656, 'longitude' => 108.1218952, 'alamat' => 'Jl.Cibeureum, Cikeusal, Kec. Tanjungjaya, Kabupaten Tasikmalaya, Jawa Barat 46184'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '17', 'nama' => 'Sukaraja', 'latitude' => -7.4522569, 'longitude' => 108.1913869, 'alamat' => 'Jl. Raya Sukaraja - Mangunreja, Sukapura, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46185'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '18', 'nama' => 'Salopa', 'latitude' => -7.517136, 'longitude' => 108.2699604, 'alamat' => 'Kawitan, Kec. Salopa, Kabupaten Tasikmalaya, Jawa Barat 46192'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '19', 'nama' => 'Jatiwaras', 'latitude' => -7.4845793, 'longitude' => 108.2328193, 'alamat' => 'Jl. Raya Salopa, Jatiwaras, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '20', 'nama' => 'Cineam', 'latitude' => -7.4086272, 'longitude' => 108.3594839, 'alamat' => 'Jl. Karanglayung, Cijulang, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '21', 'nama' => 'Karang Jaya', 'latitude' => -7.4335298, 'longitude' => 108.3909761, 'alamat' => 'Karangjaya, Kec. Karangjaya, Kabupaten Tasikmalaya, Jawa Barat 46198'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '22', 'nama' => 'Manonjaya', 'latitude' => -7.3508016, 'longitude' => 108.3081414, 'alamat' => 'Jl. RTA. Prawira Adiningrat No.135, Manonjaya, Kec. Manonjaya, Kabupaten Tasikmalaya, Jawa Barat 46197'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '23', 'nama' => 'Gunung Tanjung', 'latitude' => -7.4150337, 'longitude' => 108.2834732, 'alamat' => 'Jl. Raya Gn. Tj., Tanjungsari, Kec. Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat 46418'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '24', 'nama' => 'Singaparna', 'latitude' => -7.354841, 'longitude' => 108.1079465, 'alamat' => 'Jl. Raya Pemda, Singasari, Kec. Singaparna, Kabupaten Tasikmalaya, Jawa Barat 46412'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '25', 'nama' => 'Mangunreja', 'latitude' => -7.366142, 'longitude' => 108.0929691, 'alamat' => 'Jl. Kaum Selatan, Mangunreja, Kec. Mangunreja, Kabupaten Tasikmalaya, Jawa Barat 46462'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '26', 'nama' => 'Sukarame', 'latitude' => -7.3633156, 'longitude' => 108.1355694, 'alamat' => 'Jl.lapang 1, Sukarame, Kec. Sukarame, Kabupaten Tasikmalaya, Jawa Barat 46461'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '27', 'nama' => 'Cigalontang', 'latitude' => -7.3524479, 'longitude' => 108.0318921, 'alamat' => 'Jayapura, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '28', 'nama' => 'Leuwisari', 'latitude' => -7.3366507, 'longitude' => 108.1012312, 'alamat' => 'Arjasari, Kec. Leuwisari, Kabupaten Tasikmalaya, Jawa Barat 46464'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '29', 'nama' => 'Padakembang', 'latitude' => -7.308683, 'longitude' => 108.1214238, 'alamat' => 'Jalan Batubeulah No. 1, Cibenda, Cisaruni, Padakembang, Cisaruni, Tasikmalaya, Kabupaten Tasikmalaya, Jawa Barat 46466'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '30', 'nama' => 'Sariwangi', 'latitude' => -7.3171318, 'longitude' => 108.0570483, 'alamat' => 'Jayaratu, Kec. Sariwangi, Kabupaten Tasikmalaya, Jawa Barat 46465'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '31', 'nama' => 'Sukaratu', 'latitude' => -7.2768192, 'longitude' => 108.1464349, 'alamat' => 'Sukaratu, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat 46415'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '32', 'nama' => 'Cisayong', 'latitude' => -7.2604297, 'longitude' => 108.1586648, 'alamat' => 'Jl. Raya Cisayong No.20, Cisayong, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '33', 'nama' => 'Sukahening', 'latitude' => -7.2064197, 'longitude' => 108.1528136, 'alamat' => 'Calingcing, Kec. Sukahening, Kabupaten Tasikmalaya, Jawa Barat 46155'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '34', 'nama' => 'Rajapolah', 'latitude' => -7.2200664, 'longitude' => 108.1906081, 'alamat' => 'Jl. Raya Rajapolah No.200, Manggungjaya, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '35', 'nama' => 'Jamanis', 'latitude' => -7.189581, 'longitude' => 108.1826423, 'alamat' => 'Jl. Raya Jamanis No.33, Tanjungmekar, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '36', 'nama' => 'Ciawi', 'latitude' => -7.159301, 'longitude' => 108.1472142, 'alamat' => 'Bekanegara Jl. Kusnadi Belanegara No.110, Ciawi, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '37', 'nama' => 'Kadipaten', 'latitude' => -7.1178299, 'longitude' => 108.1320573, 'alamat' => 'Jl. Raya Lkr. Gentong No.17, Buniasih, Kec. Kadipaten, Kabupaten Tasikmalaya, Jawa Barat 46156'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '38', 'nama' => 'Pagerageung', 'latitude' => -7.1131173, 'longitude' => 108.162996, 'alamat' => 'Jl. Raya Pagerageung , Pagerageung, Kec. Pagerageung, Kabupaten Tasikmalaya, Jawa Barat 46158'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kode' => '39', 'nama' => 'Sukaresik', 'latitude' => -7.1556392, 'longitude' => 108.1832715, 'alamat' => 'Jl. Raya Sukaratu, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46471'],
        ];

        $now = now();
        $data = array_map(fn($item) => array_merge($item, [
            'created_at' => $now,
            'updated_at' => $now,
        ]), $data);

        DB::table('wilayah_kecamatan')->insert($data);
    }
}