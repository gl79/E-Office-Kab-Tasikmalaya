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
            ['nama' => 'Dinas Kesehatan Daerah', 'singkatan' => 'Dinas Kesehatan'],
            ['nama' => 'Rumah Sakit Umum Daerah KHZ Mustafa', 'singkatan' => 'RSUD KHZ Mustafa'],
            ['nama' => 'Rumah Sakit Umum Daerah Tani Nelayan', 'singkatan' => 'RSUD Tani Nelayan'],
            ['nama' => 'Dinas Pendidikan Daerah', 'singkatan' => 'Dinas Pendidikan'],
            ['nama' => 'Dinas Sosial Daerah', 'singkatan' => 'Dinas Sosial'],
            ['nama' => 'Pekerjaan Umum, Tata Ruang, Perumahan Rakyat, Kawasan Permukiman dan Lingkungan Hidup', 'singkatan' => 'Dinas PUTRPRKPLH'],
            ['nama' => 'Satuan Polisi Pamong Praja', 'singkatan' => 'Satpol PP'],
            ['nama' => 'Badan Penanggulangan Bencana Daerah', 'singkatan' => 'BPBD'],
            ['nama' => 'Dinas Koperasi, Usaha Kecil dan Menengah, serta Perdagangan', 'singkatan' => 'Dinas Kopukmindag'],
            ['nama' => 'Dinas Pertanian Daerah', 'singkatan' => 'Dinas Pertanian'],
            ['nama' => 'Penanaman Modal dan Pelayanan Terpadu Satu Pintu', 'singkatan' => 'Dinas PMPTSP'],
            ['nama' => 'Pemberdayaan Masyarakat dan Desa', 'singkatan' => 'Dinas PMD'],
            ['nama' => 'Dinas Perhubungan, Komunikasi, dan Informatika', 'singkatan' => 'Dishubkominfo'],
            ['nama' => 'Dinas Kependudukan dan Pencatatan Sipil', 'singkatan' => 'Disdukcapil'],
            ['nama' => 'Dinas Pariwisata, Kebudayaan, dan Pemuda Olahraga', 'singkatan' => 'Disparbudpora'],
            ['nama' => 'Badan Kesatuan Bangsa dan Politik', 'singkatan' => 'Kesbangpol'],
            ['nama' => 'Inspektorat Daerah', 'singkatan' => 'Inspektorat'],
            ['nama' => 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia', 'singkatan' => 'BKPSDM'],
            ['nama' => 'Badan Pengelolaan Keuangan dan Pendapatan Daerah', 'singkatan' => 'BPKPD'],
            ['nama' => 'Sekretariat Daerah', 'singkatan' => 'Setda'],
            ['nama' => 'Sekretariat Dewan Perwakilan Rakyat Daerah', 'singkatan' => 'Sekretariat DPRD'],
            ['nama' => 'Badan Perencanaan, Penelitian, dan Pengembangan Daerah', 'singkatan' => 'Bappelitbangda'],
        ];

        foreach ($units as $unit) {
            UnitKerja::firstOrCreate(['singkatan' => $unit['singkatan']], $unit);
        }
    }
}
