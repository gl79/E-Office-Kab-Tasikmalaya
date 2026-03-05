<?php

namespace App\Policies;

use App\Models\DisposisiSurat;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;

class SuratMasukPolicy
{
    /**
     * Semua user yang authenticated bisa melihat daftar surat.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Superadmin, TU, dan Pejabat bisa lihat semua.
     * User biasa hanya bisa lihat surat yang ditujukan ke mereka.
     */
    public function view(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin() || $user->isTU() || $user->isPejabat()) {
            return true;
        }

        // User biasa: hanya kalau ada di tujuan ATAU di rantai disposisi
        return $this->isInvolvedInSurat($user, $suratMasuk);
    }

    /**
     * Hanya Superadmin dan TU yang bisa membuat surat masuk.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Hanya Superadmin dan TU yang bisa mengedit surat masuk.
     */
    public function update(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Hanya Superadmin dan TU yang bisa menghapus surat masuk.
     */
    public function delete(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Policy untuk restore/forceDelete (backward compatibility).
     */
    public function restore(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    public function forceDelete(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    // ==================== AKSI SURAT MASUK ====================

    /**
     * Terima / Diketahui — hanya primary recipient yang sudah menerima surat
     * ATAU penerima disposisi yang surat didisposisi ke mereka.
     */
    public function terimaDisketahui(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Tidak bisa jika surat sudah selesai
        if ($suratMasuk->status === SuratMasuk::STATUS_SELESAI) {
            return false;
        }

        return $this->isActionableRecipient($user, $suratMasuk);
    }

    /**
     * Disposisi — hanya penerima primer/disposisi yang sudah terima surat & bisa disposisi.
     * Surat tidak boleh sudah selesai.
     */
    public function disposisi(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->canDispose()) {
            return false;
        }

        // Surat sudah selesai atau jadwal sudah definitif
        if ($suratMasuk->isSelesai()) {
            return false;
        }

        return $this->isActionableRecipient($user, $suratMasuk);
    }

    /**
     * Jadwalkan — sama seperti disposisi, tapi buat jadwal tentatif langsung.
     */
    public function jadwalkan(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->canDispose()) {
            return false;
        }

        // Surat sudah selesai atau jadwal sudah ada
        if ($suratMasuk->isSelesai() || $suratMasuk->hasPenjadwalan()) {
            return false;
        }

        return $this->isActionableRecipient($user, $suratMasuk);
    }

    /**
     * Penerima surat bisa menerima surat (tombol Terima untuk penerimaan awal).
     */
    public function acceptByRecipient(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->canDispose()) {
            return false;
        }

        return $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->exists();
    }

    /**
     * Lihat timeline — semua pihak yang terlibat dalam surat.
     */
    public function viewTimeline(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin() || $user->isTU()) {
            return true;
        }

        return $this->isInvolvedInSurat($user, $suratMasuk);
    }

    /**
     * Backward compatibility: scheduleByBupati
     */
    public function scheduleByBupati(User $user, SuratMasuk $suratMasuk): bool
    {
        return $this->jadwalkan($user, $suratMasuk)
            || ($suratMasuk->hasPenjadwalan() && $this->isActionableRecipient($user, $suratMasuk));
    }

    /**
     * Backward compatibility: disposisiByBupati → redirect ke disposisi
     */
    public function disposisiByBupati(User $user, SuratMasuk $suratMasuk): bool
    {
        return $this->disposisi($user, $suratMasuk);
    }

    /**
     * Backward compatibility: finalizeDelegatedJadwal
     */
    public function finalizeDelegatedJadwal(User $user, SuratMasuk $suratMasuk): bool
    {
        return false;
    }

    // ==================== PRIVATE HELPERS ====================

    /**
     * Cek apakah user ini adalah "actionable recipient":
     * - Primary recipient yang sudah diterima, ATAU
     * - Penerima disposisi terakhir dalam rantai yang sudah dibaca
     */
    private function isActionableRecipient(User $user, SuratMasuk $suratMasuk): bool
    {
        // Cek 1: Apakah user adalah primary recipient yang sudah diterima?
        $tujuan = $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->where('is_primary', true)
            ->where('is_tembusan', false)
            ->where('status_penerimaan', SuratMasukTujuan::STATUS_DITERIMA)
            ->first();

        if ($tujuan) {
            // Cek apakah user BELUM mendisposisi surat ini (belum diteruskan)
            $hasDisposed = DisposisiSurat::where('surat_masuk_id', $suratMasuk->id)
                ->where('dari_user_id', $user->id)
                ->exists();

            // Primary yang belum disposisi = bisa aksi
            if (!$hasDisposed) {
                return true;
            }
        }

        // Cek 2: Apakah user adalah penerima disposisi terakhir?
        $lastDisposisiToUser = DisposisiSurat::where('surat_masuk_id', $suratMasuk->id)
            ->where('ke_user_id', $user->id)
            ->latest()
            ->first();

        if ($lastDisposisiToUser) {
            // User sudah menerima disposisi — cek belum diteruskan lagi
            $hasRedisposed = DisposisiSurat::where('surat_masuk_id', $suratMasuk->id)
                ->where('dari_user_id', $user->id)
                ->exists();

            return !$hasRedisposed;
        }

        return false;
    }

    /**
     * Cek apakah user terlibat dalam surat (tujuan, tembusan, staff pengolah, rantai disposisi).
     */
    private function isInvolvedInSurat(User $user, SuratMasuk $suratMasuk): bool
    {
        // Penerima (primer atau tembusan)
        if ($suratMasuk->tujuans()->where('tujuan_id', $user->id)->exists()) {
            return true;
        }

        // Staff pengolah
        if ($suratMasuk->staff_pengolah_id === $user->id) {
            return true;
        }

        // Dalam rantai disposisi (pengirim atau penerima)
        return DisposisiSurat::where('surat_masuk_id', $suratMasuk->id)
            ->where(function ($q) use ($user) {
                $q->where('dari_user_id', $user->id)
                    ->orWhere('ke_user_id', $user->id);
            })
            ->exists();
    }
}
