<?php

namespace Database\Seeders;

use App\Models\IndeksSurat;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SuratMasukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all indeks surat for variety
        $indeksSuratList = IndeksSurat::all();
        $user = User::first();

        if ($indeksSuratList->isEmpty() || !$user) {
            $this->command->warn('Pastikan IndeksSuratSeeder dan UserSeeder sudah dijalankan terlebih dahulu.');
            return;
        }

        $tujuanOptions = SuratMasuk::TUJUAN_OPTIONS;
        $sifatOptions = array_keys(SuratMasuk::SIFAT_OPTIONS);
        $asalSuratList = [
            'Kementerian Dalam Negeri',
            'Pemerintah Provinsi Jawa Barat',
            'Dinas Kesehatan Provinsi Jawa Barat',
            'Badan Perencanaan Pembangunan Nasional',
            'Sekretariat Negara Republik Indonesia',
            'Inspektorat Jenderal Kemendagri',
            'Kementerian Keuangan Republik Indonesia',
            'BPK Perwakilan Jawa Barat',
            'DPRD Kabupaten Tasikmalaya',
            'Kejaksaan Negeri Tasikmalaya',
        ];

        $perihalList = [
            'Undangan Rapat Koordinasi Pembangunan Daerah',
            'Permohonan Data Statistik Kependudukan',
            'Pemberitahuan Jadwal Kunjungan Kerja',
            'Laporan Hasil Audit Keuangan Tahun 2025',
            'Surat Edaran Tentang Protokol Kesehatan',
            'Undangan Musyawarah Perencanaan Pembangunan',
            'Permohonan Bantuan Sarana Prasarana',
            'Pemberitahuan Perubahan Kebijakan Anggaran',
            'Surat Perintah Perjalanan Dinas',
            'Laporan Evaluasi Kinerja Triwulan',
        ];

        $baseDate = Carbon::now()->subMonths(3);

        for ($i = 1; $i <= 10; $i++) {
            $tanggalSurat = $baseDate->copy()->addDays(rand(1, 90));
            $tanggalDiterima = $tanggalSurat->copy()->addDays(rand(1, 5));

            // Use different indeks surat for variety
            $indeksBerkas = $indeksSuratList->random();
            $kodeKlasifikasi = $indeksSuratList->random();

            $suratMasuk = SuratMasuk::create([
                'nomor_agenda' => 'SM/' . str_pad($i, 4, '0', STR_PAD_LEFT) . '/' . date('Y'),
                'tanggal_diterima' => $tanggalDiterima,
                'tanggal_surat' => $tanggalSurat,
                'asal_surat' => $asalSuratList[$i - 1],
                'nomor_surat' => 'B/' . rand(100, 999) . '/' . rand(1, 12) . '/' . date('Y'),
                'sifat' => $sifatOptions[array_rand($sifatOptions)],
                'lampiran' => rand(0, 5),
                'perihal' => $perihalList[$i - 1],
                'isi_ringkas' => 'Isi ringkas dari ' . strtolower($perihalList[$i - 1]) . ' yang dikirimkan oleh ' . $asalSuratList[$i - 1] . '.',
                'indeks_berkas_id' => $indeksBerkas->id,
                'kode_klasifikasi_id' => $kodeKlasifikasi->id,
                'staff_pengolah_id' => $user->id,
                'tanggal_diteruskan' => $tanggalDiterima->copy()->addDays(rand(1, 3)),
                'catatan_tambahan' => 'Catatan untuk surat masuk dengan indeks ' . $indeksBerkas->nama,
                'created_by' => $user->id,
            ]);

            // Add random tujuan (1-3)
            $numTujuan = rand(1, 3);
            $selectedTujuan = array_rand(array_flip($tujuanOptions), $numTujuan);
            $selectedTujuan = is_array($selectedTujuan) ? $selectedTujuan : [$selectedTujuan];

            foreach ($selectedTujuan as $tujuan) {
                SuratMasukTujuan::create([
                    'surat_masuk_id' => $suratMasuk->id,
                    'tujuan' => $tujuan,
                ]);
            }
        }

        $this->command->info('10 data Surat Masuk berhasil dibuat.');
    }
}
