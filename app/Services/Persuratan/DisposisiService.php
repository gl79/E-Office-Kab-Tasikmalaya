<?php

declare(strict_types=1);

namespace App\Services\Persuratan;

use App\Models\DisposisiSurat;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\TimelineSurat;
use App\Models\User;
use App\Support\CacheHelper;
use Illuminate\Support\Facades\DB;

/**
 * Service untuk mengelola disposisi chain dan aksi surat masuk
 * (terima/diketahui, jadwalkan, disposisi).
 */
final class DisposisiService
{
    /**
     * Terima / Diketahui — surat hanya perlu diketahui, tidak perlu tindak lanjut.
     * Status surat → selesai, timeline dicatat.
     */
    public function terimaDisketahui(SuratMasuk $suratMasuk, User $user): array
    {
        return DB::transaction(function () use ($suratMasuk, $user) {
            $jabatanNama = $user->jabatan_nama ?? $user->name;

            // Update status surat → selesai
            $suratMasuk->update(['status' => SuratMasuk::STATUS_SELESAI]);

            // Catat timeline
            TimelineSurat::record(
                $suratMasuk->id,
                $user->id,
                TimelineSurat::AKSI_TERIMA,
                "{$jabatanNama} telah menerima dan mengetahui surat"
            );

            CacheHelper::flush(['persuratan_list', 'penjadwalan']);

            return [
                'success' => true,
                'message' => 'Surat berhasil diterima dan diketahui.',
            ];
        });
    }

    /**
     * Disposisi surat ke pejabat bawahan.
     * 1 surat hanya bisa didisposisi ke 1 penerima per langkah.
     */
    public function disposisi(SuratMasuk $suratMasuk, User $dariUser, User $keUser, ?string $catatan = null): array
    {
        // Validasi: penerima harus level lebih tinggi angkanya (lebih rendah hierarki)
        if (!$dariUser->canDisposeToUser($keUser)) {
            return [
                'success' => false,
                'message' => 'Tidak bisa disposisi ke pejabat dengan level yang sama atau lebih tinggi.',
            ];
        }

        return DB::transaction(function () use ($suratMasuk, $dariUser, $keUser, $catatan) {
            $dariJabatan = $dariUser->jabatan_nama ?? $dariUser->name;
            $keJabatan = $keUser->jabatan_nama ?? $keUser->name;

            // Buat record disposisi chain
            DisposisiSurat::create([
                'surat_masuk_id' => $suratMasuk->id,
                'dari_user_id' => $dariUser->id,
                'ke_user_id' => $keUser->id,
                'catatan' => $catatan,
            ]);

            // Update status surat → diproses
            if ($suratMasuk->status !== SuratMasuk::STATUS_DIPROSES) {
                $suratMasuk->update(['status' => SuratMasuk::STATUS_DIPROSES]);
            }

            // Catat timeline
            TimelineSurat::record(
                $suratMasuk->id,
                $dariUser->id,
                TimelineSurat::AKSI_DISPOSISI,
                "{$dariJabatan} mendisposisi surat ke {$keJabatan}" . ($catatan ? " — {$catatan}" : '')
            );

            CacheHelper::flush(['persuratan_list', 'penjadwalan']);

            return [
                'success' => true,
                'message' => "Surat berhasil didisposisi ke {$keJabatan}.",
            ];
        });
    }

    /**
     * Jadwalkan surat masuk sebagai kegiatan tentatif.
     * Pejabat yang menjadwalkan adalah pemilik jadwal.
     */
    public function jadwalkan(SuratMasuk $suratMasuk, User $user, array $jadwalData): array
    {
        return DB::transaction(function () use ($suratMasuk, $user, $jadwalData) {
            $jabatanNama = $user->jabatan_nama ?? $user->name;

            // Buat jadwal tentatif
            $penjadwalan = Penjadwalan::create([
                'surat_masuk_id' => $suratMasuk->id,
                'nama_kegiatan' => $jadwalData['judul_kegiatan'],
                'tanggal_agenda' => $jadwalData['tanggal'],
                'waktu_mulai' => $jadwalData['waktu_mulai'],
                'waktu_selesai' => $jadwalData['waktu_selesai'] ?? null,
                'sampai_selesai' => !empty($jadwalData['sampai_selesai']),
                'lokasi_type' => $jadwalData['lokasi_type'] ?? Penjadwalan::LOKASI_DALAM_DAERAH,
                'tempat' => $jadwalData['lokasi'],
                'keterangan' => $jadwalData['keterangan'] ?? null,
                'status' => Penjadwalan::STATUS_TENTATIF,
                'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
                'sumber_jadwal' => Penjadwalan::SUMBER_SELF,
                'dihadiri_oleh' => $user->name,
                'dihadiri_oleh_user_id' => $user->id,
                'pemilik_jadwal_id' => $user->id,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            // Update status surat → diproses
            if ($suratMasuk->status !== SuratMasuk::STATUS_DIPROSES) {
                $suratMasuk->update(['status' => SuratMasuk::STATUS_DIPROSES]);
            }

            // Catat timeline
            TimelineSurat::record(
                $suratMasuk->id,
                $user->id,
                TimelineSurat::AKSI_JADWALKAN,
                "{$jabatanNama} menjadwalkan kegiatan (Tentatif): {$jadwalData['judul_kegiatan']}"
            );

            CacheHelper::flush(['persuratan_list', 'penjadwalan']);

            return [
                'success' => true,
                'message' => 'Kegiatan berhasil dijadwalkan (Tentatif).',
                'penjadwalan_id' => $penjadwalan->id,
            ];
        });
    }

    /**
     * Dapatkan daftar pejabat yang bisa menerima disposisi dari user ini.
     * Hanya user dengan level jabatan lebih tinggi angkanya (hierarki lebih rendah).
     */
    public function getDisposisiTargets(User $fromUser): \Illuminate\Database\Eloquent\Collection
    {
        $fromLevel = $fromUser->getJabatanLevel();

        if ($fromLevel === null) {
            return User::query()->where('id', 0)->get(); // empty collection
        }

        return User::query()
            ->select(['users.id', 'users.name', 'users.jabatan_id'])
            ->with('jabatanRelasi:id,nama,level')
            ->where('users.role', '!=', User::ROLE_SUPERADMIN)
            ->whereHas('jabatanRelasi', function ($q) use ($fromLevel) {
                $q->where('level', '>', $fromLevel);
            })
            ->leftJoin('jabatans', 'users.jabatan_id', '=', 'jabatans.id')
            ->orderBy('jabatans.level')
            ->orderBy('users.name')
            ->get(['users.id', 'users.name', 'users.jabatan_id']);
    }
}
