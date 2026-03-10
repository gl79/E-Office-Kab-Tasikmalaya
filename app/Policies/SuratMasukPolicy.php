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
     * Disposisi - hanya penerima primer/disposisi yang sudah menerima surat dan bisa disposisi.
     */
    public function disposisi(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->canDispose()) {
            return false;
        }

        if ($suratMasuk->isSelesai()) {
            return false;
        }

        return $this->isActionableRecipient($user, $suratMasuk);
    }

    /**
     * Jadwalkan - sama seperti disposisi, tapi buat jadwal tentatif langsung.
     */
    public function jadwalkan(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->canDispose()) {
            return false;
        }

        if ($suratMasuk->isSelesai() || $suratMasuk->hasPenjadwalan()) {
            return false;
        }

        return $this->isActionableRecipient($user, $suratMasuk);
    }

    /**
     * Masukkan ke jadwal - sama seperti jadwalkan.
     */
    public function masukkanJadwal(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->canDispose()) {
            return false;
        }

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
            ->where('tujuan_id', '=', $user->id)
            ->exists();
    }

    /**
     * Lihat timeline - semua pihak yang terlibat dalam surat.
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
     * Backward compatibility: disposisiByBupati
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
     * Cek apakah user ini actionable recipient:
     * - primary recipient yang sudah menerima, atau
     * - penerima disposisi terakhir yang sudah menerima.
     */
    private function isActionableRecipient(User $user, SuratMasuk $suratMasuk): bool
    {
        $tujuanPrimary = $suratMasuk->tujuans()
            ->where('tujuan_id', '=', $user->id)
            ->where('is_primary', '=', true)
            ->where('is_tembusan', '=', false)
            ->first();

        if ($tujuanPrimary) {
            if ($tujuanPrimary->status_penerimaan !== SuratMasukTujuan::STATUS_DITERIMA) {
                return false;
            }

            $hasDisposed = DisposisiSurat::where('surat_masuk_id', '=', $suratMasuk->id)
                ->where('dari_user_id', '=', $user->id)
                ->exists();

            if (!$hasDisposed) {
                return true;
            }
        }

        $lastDisposisiToUser = DisposisiSurat::where('surat_masuk_id', '=', $suratMasuk->id)
            ->where('ke_user_id', '=', $user->id)
            ->latest()
            ->first();

        if (!$lastDisposisiToUser) {
            return false;
        }

        $tujuanDisposisi = $suratMasuk->tujuans()
            ->where('tujuan_id', '=', $user->id)
            ->first();

        if (!$tujuanDisposisi || $tujuanDisposisi->status_penerimaan !== SuratMasukTujuan::STATUS_DITERIMA) {
            return false;
        }

        $hasRedisposed = DisposisiSurat::where('surat_masuk_id', '=', $suratMasuk->id)
            ->where('dari_user_id', '=', $user->id)
            ->exists();

        return !$hasRedisposed;
    }

    /**
     * Cek apakah user terlibat dalam surat (tujuan, tembusan, staff pengolah, rantai disposisi).
     */
    private function isInvolvedInSurat(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($suratMasuk->tujuans()->where('tujuan_id', '=', $user->id)->exists()) {
            return true;
        }

        if ($suratMasuk->staff_pengolah_id === $user->id) {
            return true;
        }

        return DisposisiSurat::where('surat_masuk_id', '=', $suratMasuk->id)
            ->where(function ($q) use ($user) {
                $q->where('dari_user_id', '=', $user->id)
                    ->orWhere('ke_user_id', '=', $user->id);
            })
            ->exists();
    }
}
