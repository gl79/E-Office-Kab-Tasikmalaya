<?php

namespace Database\Seeders;

use App\Models\IndeksSurat;
use App\Models\SuratKeluar;
use App\Models\UnitKerja;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SuratKeluarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all data for variety
        $indeksSuratList = IndeksSurat::all();
        $unitKerjaList = UnitKerja::all();
        $user = User::first();

        if ($indeksSuratList->isEmpty() || $unitKerjaList->isEmpty() || !$user) {
            $this->command->warn('Pastikan IndeksSuratSeeder, UnitKerjaSeeder, dan UserSeeder sudah dijalankan terlebih dahulu.');
            return;
        }

        $sifat1Options = array_keys(SuratKeluar::SIFAT_1_OPTIONS);
        $sifat2Options = array_keys(SuratKeluar::SIFAT_2_OPTIONS);

        $kepadaList = [
            'Kepala Dinas Kesehatan Kabupaten Tasikmalaya',
            'Camat Se-Kabupaten Tasikmalaya',
            'Kepala Dinas Pendidikan Kabupaten Tasikmalaya',
            'Sekretaris Daerah Kabupaten Tasikmalaya',
            'Kepala BPKAD Kabupaten Tasikmalaya',
            'Inspektur Kabupaten Tasikmalaya',
            'Kepala Bappeda Kabupaten Tasikmalaya',
            'Ketua DPRD Kabupaten Tasikmalaya',
            'Kepala BKPSDM Kabupaten Tasikmalaya',
            'Direktur RSUD Singaparna',
        ];

        $perihalList = [
            'Pemberitahuan Pelaksanaan Vaksinasi Massal',
            'Instruksi Pelaksanaan Program Prioritas Daerah',
            'Undangan Rapat Dinas Bulanan',
            'Permintaan Laporan Realisasi Anggaran',
            'Pemberitahuan Hari Libur Nasional',
            'Surat Perintah Tugas Pengawasan',
            'Undangan Musrenbang Tingkat Kabupaten',
            'Penyampaian Raperda APBD Perubahan',
            'Permohonan Tenaga Ahli Kepegawaian',
            'Koordinasi Pelayanan Kesehatan Rujukan',
        ];

        $baseDate = Carbon::now()->subMonths(3);

        for ($i = 1; $i <= 10; $i++) {
            $tanggalSurat = $baseDate->copy()->addDays(rand(1, 90));

            // Use different unit kerja and indeks surat for variety
            $unitKerja = $unitKerjaList->random();
            $indeks = $indeksSuratList->random();
            $kodeKlasifikasi = $indeksSuratList->random();

            SuratKeluar::create([
                'tanggal_surat' => $tanggalSurat,
                'no_urut' => $i,
                'nomor_surat' => $unitKerja->singkatan . '/' . str_pad($i, 3, '0', STR_PAD_LEFT) . '/' . $indeks->kode . '/' . date('Y'),
                'kepada' => $kepadaList[$i - 1],
                'perihal' => $perihalList[$i - 1],
                'isi_ringkas' => 'Isi ringkas dari ' . strtolower($perihalList[$i - 1]) . ' yang ditujukan kepada ' . $kepadaList[$i - 1] . '.',
                'sifat_1' => $sifat1Options[array_rand($sifat1Options)],
                'sifat_2' => $sifat2Options[array_rand($sifat2Options)],
                'indeks_id' => $indeks->id,
                'kode_klasifikasi_id' => $kodeKlasifikasi->id,
                'unit_kerja_id' => $unitKerja->id,
                'kode_pengolah' => $unitKerja->singkatan,
                'lampiran' => rand(0, 5),
                'catatan' => 'Surat keluar dari ' . $unitKerja->nama . ' dengan klasifikasi ' . $indeks->nama,
                'created_by' => $user->id,
            ]);
        }

        $this->command->info('10 data Surat Keluar berhasil dibuat.');
    }
}
