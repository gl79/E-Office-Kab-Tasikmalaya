<?php

namespace Database\Seeders;

use App\Models\JenisSurat;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use Illuminate\Database\Seeder;

class SuratMasukDummySeeder extends Seeder
{
    /**
     * Seed 5 dummy Surat Masuk records with government-relevant content.
     *
     * Seeder ini sengaja tidak dipanggil dari DatabaseSeeder
     * agar dijalankan manual saat dibutuhkan.
     */
    public function run(): void
    {
        $creator = User::query()->where('role', User::ROLE_TU)->first()
            ?? User::query()->first();

        $creatorId = $creator?->id;
        $year = (string) now()->year;

        $jenisSuratMap = JenisSurat::query()->pluck('id', 'nama');

        $recipientPool = User::query()
            ->whereIn('username', ['bupati', 'wakilbupati', 'sekda', 'asda1', 'asda2'])
            ->get()
            ->keyBy('username');

        $fallbackRecipient = $recipientPool->first()
            ?? User::query()->where('role', '!=', User::ROLE_SUPERADMIN)->first()
            ?? $creator;

        $rows = [
            [
                'nomor_agenda' => "SM/0201/{$year}",
                'tanggal_diterima' => now()->subDays(14)->toDateString(),
                'tanggal_surat' => now()->subDays(15)->toDateString(),
                'asal_surat' => 'Forum Kepala Desa Kabupaten Tasikmalaya',
                'nomor_surat' => "FKD/UND/031/{$year}",
                'jenis_surat_nama' => 'Surat Permohonan',
                'sifat' => 'biasa',
                'lampiran' => 2,
                'perihal' => 'Permohonan Audiensi Program Ketahanan Pangan Desa',
                'isi_ringkas' => 'Permohonan jadwal audiensi bersama Bupati terkait sinkronisasi program ketahanan pangan desa.',
                'status_tindak_lanjut' => SuratMasuk::STATUS_TINDAK_LANJUT_MENUNGGU,
                'tujuan_username' => 'bupati',
            ],
            [
                'nomor_agenda' => "SM/0202/{$year}",
                'tanggal_diterima' => now()->subDays(10)->toDateString(),
                'tanggal_surat' => now()->subDays(11)->toDateString(),
                'asal_surat' => 'Kementerian Dalam Negeri Republik Indonesia',
                'nomor_surat' => "KEMENDAGRI/OTDA/112/{$year}",
                'jenis_surat_nama' => 'Surat Undangan',
                'sifat' => 'terbatas',
                'lampiran' => 1,
                'perihal' => 'Undangan Rakor Pengendalian Inflasi Daerah',
                'isi_ringkas' => 'Undangan rapat koordinasi pengendalian inflasi daerah tingkat provinsi dan kabupaten/kota.',
                'status_tindak_lanjut' => SuratMasuk::STATUS_TINDAK_LANJUT_TENTATIF,
                'tujuan_username' => 'sekda',
            ],
            [
                'nomor_agenda' => "SM/0203/{$year}",
                'tanggal_diterima' => now()->subDays(7)->toDateString(),
                'tanggal_surat' => now()->subDays(8)->toDateString(),
                'asal_surat' => 'BPBD Kabupaten Tasikmalaya',
                'nomor_surat' => "BPBD/LAP/078/{$year}",
                'jenis_surat_nama' => 'Laporan',
                'sifat' => 'rahasia',
                'lampiran' => 4,
                'perihal' => 'Laporan Cepat Penanganan Banjir Kecamatan Manonjaya',
                'isi_ringkas' => 'Laporan perkembangan penanganan banjir dan kebutuhan dukungan lintas perangkat daerah.',
                'status_tindak_lanjut' => SuratMasuk::STATUS_TINDAK_LANJUT_DISPOSISI,
                'tujuan_username' => 'bupati',
            ],
            [
                'nomor_agenda' => "SM/0204/{$year}",
                'tanggal_diterima' => now()->subDays(4)->toDateString(),
                'tanggal_surat' => now()->subDays(5)->toDateString(),
                'asal_surat' => 'Kantor Kementerian Agama Kabupaten Tasikmalaya',
                'nomor_surat' => "KEMENAG/MTQ/045/{$year}",
                'jenis_surat_nama' => 'Surat Undangan',
                'sifat' => 'biasa',
                'lampiran' => 1,
                'perihal' => 'Undangan Pembukaan MTQ Tingkat Kabupaten',
                'isi_ringkas' => 'Permohonan kehadiran pada pembukaan MTQ tingkat kabupaten sesuai jadwal kegiatan resmi.',
                'status_tindak_lanjut' => SuratMasuk::STATUS_TINDAK_LANJUT_DEFINITIF,
                'tujuan_username' => 'wakilbupati',
            ],
            [
                'nomor_agenda' => "SM/0205/{$year}",
                'tanggal_diterima' => now()->subDays(1)->toDateString(),
                'tanggal_surat' => now()->subDays(2)->toDateString(),
                'asal_surat' => 'Bappelitbangda Kabupaten Tasikmalaya',
                'nomor_surat' => "BAPPELITBANGDA/EV/021/{$year}",
                'jenis_surat_nama' => 'Laporan',
                'sifat' => 'biasa',
                'lampiran' => 3,
                'perihal' => 'Laporan Evaluasi Kinerja Triwulan I',
                'isi_ringkas' => 'Laporan hasil evaluasi kinerja program prioritas daerah triwulan I sebagai bahan pengambilan keputusan.',
                'status_tindak_lanjut' => SuratMasuk::STATUS_TINDAK_LANJUT_SELESAI,
                'tujuan_username' => 'asda1',
            ],
        ];

        foreach ($rows as $row) {
            $legacyStatus = match ($row['status_tindak_lanjut']) {
                SuratMasuk::STATUS_TINDAK_LANJUT_MENUNGGU => SuratMasuk::STATUS_BARU,
                SuratMasuk::STATUS_TINDAK_LANJUT_SELESAI => SuratMasuk::STATUS_SELESAI,
                default => SuratMasuk::STATUS_DIPROSES,
            };

            $suratMasuk = SuratMasuk::query()->updateOrCreate(
                ['nomor_surat' => $row['nomor_surat']],
                [
                    'nomor_agenda' => $row['nomor_agenda'],
                    'tanggal_diterima' => $row['tanggal_diterima'],
                    'tanggal_surat' => $row['tanggal_surat'],
                    'asal_surat' => $row['asal_surat'],
                    'sifat' => $row['sifat'],
                    'lampiran' => $row['lampiran'],
                    'perihal' => $row['perihal'],
                    'isi_ringkas' => $row['isi_ringkas'],
                    'jenis_surat_id' => $jenisSuratMap[$row['jenis_surat_nama']] ?? null,
                    'status' => $legacyStatus,
                    'status_tindak_lanjut' => $row['status_tindak_lanjut'],
                    'tanggal_diteruskan' => $row['status_tindak_lanjut'] === SuratMasuk::STATUS_TINDAK_LANJUT_MENUNGGU
                        ? null
                        : now()->toDateString(),
                    'created_by' => $creatorId,
                    'updated_by' => $creatorId,
                ]
            );

            $recipient = $recipientPool->get($row['tujuan_username']) ?? $fallbackRecipient;

            if ($recipient) {
                $isPending = $row['status_tindak_lanjut'] === SuratMasuk::STATUS_TINDAK_LANJUT_MENUNGGU;

                SuratMasukTujuan::query()->updateOrCreate(
                    [
                        'surat_masuk_id' => $suratMasuk->id,
                        'tujuan_id' => $recipient->id,
                        'is_primary' => true,
                    ],
                    [
                        'tujuan' => $recipient->name,
                        'nomor_agenda' => $row['nomor_agenda'],
                        'is_tembusan' => false,
                        'status_penerimaan' => $isPending
                            ? SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN
                            : SuratMasukTujuan::STATUS_DITERIMA,
                        'diterima_at' => $isPending ? null : now(),
                    ]
                );
            }
        }

        $this->command?->info('SuratMasukDummySeeder selesai: 5 data dummy surat masuk berhasil disiapkan.');
        $this->command?->info('Jalankan manual dengan: php artisan db:seed --class=Database\\\\Seeders\\\\SuratMasukDummySeeder');
    }
}
