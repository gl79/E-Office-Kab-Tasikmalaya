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
 * Service untuk mengelola disposisi chain surat masuk.
 */
final class DisposisiService
{
    public function __construct(
        private readonly SuratMasukService $suratMasukService,
    ) {}

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

            // Auto accept surat jika belum diterima
            /** @var \App\Models\SuratMasukTujuan|null $tujuan */
            $tujuan = $suratMasuk->tujuans()->where('tujuan_id', '=', $dariUser->id)->first();
            if ($tujuan && $tujuan->status_penerimaan !== \App\Models\SuratMasukTujuan::STATUS_DITERIMA) {
                $tujuan->update([
                    'status_penerimaan' => \App\Models\SuratMasukTujuan::STATUS_DITERIMA,
                    'diterima_at' => now(),
                ]);
            }

            // Buat record disposisi chain
            DisposisiSurat::create([
                'surat_masuk_id' => $suratMasuk->id,
                'dari_user_id' => $dariUser->id,
                'ke_user_id' => $keUser->id,
                'catatan' => $catatan,
            ]);

            // Tambahkan atau perbarui status keUser di surat_masuk_tujuans agar surat muncul di daftarnya
            /** @var \App\Models\SuratMasukTujuan|null $existingKeTujuan */
            $existingKeTujuan = $suratMasuk->tujuans()->where('tujuan_id', '=', $keUser->id)->first();
            if ($existingKeTujuan) {
                // Jika sudah ada (mungkin sebagai tembusan sebelumnya), jadikan primary
                $existingKeTujuan->update([
                    'is_primary' => true,
                    'is_tembusan' => false,
                    'status_penerimaan' => \App\Models\SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
                    'diterima_at' => null,
                ]);
            } else {
                \App\Models\SuratMasukTujuan::create([
                    'surat_masuk_id' => $suratMasuk->id,
                    'tujuan_id' => $keUser->id,
                    'tujuan' => $keUser->name,
                    'nomor_agenda' => \App\Models\SuratMasukTujuan::generateNomorAgendaForRecipient((string) $keUser->id),
                    'is_primary' => true,
                    'is_tembusan' => false,
                    'status_penerimaan' => \App\Models\SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
                    'diterima_at' => null,
                ]);
            }

            // Sinkronkan jadwal tentatif aktif (jika sudah ada) agar status & PIC sesuai disposisi terbaru.
            $jadwalTentatif = Penjadwalan::query()
                ->where('surat_masuk_id', '=', $suratMasuk->id)
                ->where('status', '=', Penjadwalan::STATUS_TENTATIF)
                ->latest()
                ->first();

            if ($jadwalTentatif) {
                $jadwalTentatif->update([
                    'status_disposisi' => $this->resolveDisposisiStatus($keUser),
                    'dihadiri_oleh' => $keUser->name,
                    'dihadiri_oleh_user_id' => $keUser->id,
                    'updated_by' => $dariUser->id,
                ]);
            }

            $this->suratMasukService->syncGlobalWorkflowStatus($suratMasuk);

            // Catat timeline
            TimelineSurat::record(
                $suratMasuk->id,
                $dariUser->id,
                TimelineSurat::AKSI_DISPOSISI,
                "{$dariJabatan} mendisposisi surat ke {$keJabatan}" . ($catatan ? " - {$catatan}" : '')
            );

            // Kirim notifikasi ke penerima baru
            $keUser->notify(new \App\Notifications\DisposisiNotification($suratMasuk, $dariUser, $catatan));

            CacheHelper::flush(['persuratan_list', 'penjadwalan']);

            return [
                'success' => true,
                'message' => "Surat berhasil didisposisi ke {$keJabatan}.",
            ];
        });
    }

    /**
     * Dapatkan daftar pejabat yang bisa menerima disposisi dari user ini.
     * Hanya user dengan level jabatan lebih tinggi angkanya (hierarki lebih rendah).
     */
    public function getDisposisiTargets(User $fromUser): \Illuminate\Database\Eloquent\Collection
    {
        if (!$fromUser->canDispose()) {
            return User::query()->where('id', 0)->get();
        }

        $fromLevel = $fromUser->getJabatanLevel();

        if ($fromLevel === null) {
            return User::query()->where('id', 0)->get(); // empty collection
        }

        return User::query()
            ->select(['users.id', 'users.name', 'users.jabatan_id'])
            ->with('jabatanRelasi:id,nama,level')
            ->where('users.role', '<>', User::ROLE_SUPERADMIN)
            ->whereHas('jabatanRelasi', function ($q) use ($fromLevel) {
                $q->where('level', '>', $fromLevel);
            })
            ->leftJoin('jabatans', 'users.jabatan_id', '=', 'jabatans.id')
            ->orderBy('jabatans.level')
            ->orderBy('users.name')
            ->get(['users.id', 'users.name', 'users.jabatan_id']);
    }

    private function resolveDisposisiStatus(User $targetUser): string
    {
        return match ($targetUser->getJabatanLevel()) {
            1 => Penjadwalan::DISPOSISI_BUPATI,
            2 => Penjadwalan::DISPOSISI_WAKIL_BUPATI,
            default => Penjadwalan::DISPOSISI_DIWAKILKAN,
        };
    }
}
