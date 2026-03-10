<?php

namespace App\Policies;

use App\Models\DisposisiSurat;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;

class PenjadwalanPolicy
{
    /**
     * Cek akses ke modul penjadwalan.
     */
    private function canAccess(User $user): bool
    {
        return in_array($user->role, [
            User::ROLE_SUPERADMIN,
            User::ROLE_PEJABAT,
            User::ROLE_TU,
        ], true);
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccess($user);
    }

    public function view(User $user, Penjadwalan $penjadwalan): bool
    {
        if (!$this->canAccess($user)) {
            return false;
        }

        if ($this->canViewAllSchedules($user)) {
            return true;
        }

        if (!$penjadwalan->surat_masuk_id) {
            return $penjadwalan->created_by === $user->id
                || $penjadwalan->dihadiri_oleh_user_id === $user->id;
        }

        if ($penjadwalan->status === Penjadwalan::STATUS_DEFINITIF) {
            return $this->isFinalizedByRecipientFromDisposisi($user, $penjadwalan);
        }

        return $this->isRelatedToSurat($user, $penjadwalan->suratMasuk);
    }

    public function create(User $user): bool
    {
        return $this->canAccess($user);
    }

    public function update(User $user, Penjadwalan $penjadwalan): bool
    {
        if (!$this->canAccess($user)) {
            return false;
        }

        if ($user->isTU()) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        // Setelah definitif, hanya pemilik jadwal atau superadmin yang bisa update
        if ($penjadwalan->isLockedDefinitif()) {
            return $penjadwalan->pemilik_jadwal_id === $user->id;
        }

        // Jadwal custom: pemilik jadwal/dihadiri user tetap bisa update.
        if (!$penjadwalan->surat_masuk_id) {
            return $penjadwalan->created_by === $user->id
                || $penjadwalan->dihadiri_oleh_user_id === $user->id;
        }

        return $this->isActiveSuratActor($user, $penjadwalan->suratMasuk);
    }

    /**
     * Finalize: hanya pemilik jadwal atau superadmin yang bisa mengubah
     * status dari tentatif ke definitif.
     */
    public function finalize(User $user, Penjadwalan $penjadwalan): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$this->canAccess($user)) {
            return false;
        }

        if ($user->isTU()) {
            return false;
        }

        // Hanya pemilik jadwal yang bisa finalize
        return $penjadwalan->pemilik_jadwal_id !== null
            && $penjadwalan->pemilik_jadwal_id === $user->id;
    }

    public function delete(User $user, Penjadwalan $penjadwalan): bool
    {
        if (!$this->canAccess($user)) {
            return false;
        }

        if ($user->isTU()) {
            return false;
        }

        // Setelah definitif, hanya superadmin yang bisa hapus
        if ($penjadwalan->isLockedDefinitif()) {
            return $user->isSuperAdmin();
        }

        return true;
    }

    public function restore(User $user, Penjadwalan $penjadwalan): bool
    {
        return $this->canAccess($user);
    }

    public function forceDelete(User $user, Penjadwalan $penjadwalan): bool
    {
        return $this->canAccess($user);
    }

    private function isActiveSuratActor(User $user, ?SuratMasuk $suratMasuk): bool
    {
        if (!$suratMasuk) {
            return false;
        }

        $tujuan = $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->where('is_primary', true)
            ->where('is_tembusan', false)
            ->first();

        if ($tujuan) {
            if ($tujuan->status_penerimaan !== SuratMasukTujuan::STATUS_DITERIMA) {
                return false;
            }

            $hasDisposed = DisposisiSurat::query()
                ->where('surat_masuk_id', $suratMasuk->id)
                ->where('dari_user_id', $user->id)
                ->exists();

            if (!$hasDisposed) {
                return true;
            }
        }

        $lastDisposisiToUser = DisposisiSurat::query()
            ->where('surat_masuk_id', $suratMasuk->id)
            ->where('ke_user_id', $user->id)
            ->latest()
            ->first();

        if (!$lastDisposisiToUser) {
            return false;
        }

        $tujuanDisposisi = $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->first();

        if (
            !$tujuanDisposisi
            || $tujuanDisposisi->status_penerimaan !== SuratMasukTujuan::STATUS_DITERIMA
        ) {
            return false;
        }

        $hasRedisposed = DisposisiSurat::query()
            ->where('surat_masuk_id', $suratMasuk->id)
            ->where('dari_user_id', $user->id)
            ->exists();

        return !$hasRedisposed;
    }

    private function isRelatedToSurat(User $user, ?SuratMasuk $suratMasuk): bool
    {
        if (!$suratMasuk) {
            return false;
        }

        if ((int) $suratMasuk->created_by === (int) $user->id) {
            return true;
        }

        $isAcceptedRecipient = $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->where('status_penerimaan', SuratMasukTujuan::STATUS_DITERIMA)
            ->exists();

        if ($isAcceptedRecipient) {
            return true;
        }

        return DisposisiSurat::query()
            ->where('surat_masuk_id', $suratMasuk->id)
            ->where('dari_user_id', $user->id)
            ->exists();
    }

    private function canViewAllSchedules(User $user): bool
    {
        if ($user->isSuperAdmin() || $user->isTU()) {
            return true;
        }

        $level = $user->getJabatanLevel();
        if (in_array($level, [1, 2, 3], true)) {
            return true;
        }

        $jabatanNama = strtolower((string) $user->jabatan_nama);
        return str_contains($jabatanNama, 'sekretaris daerah');
    }

    private function isFinalizedByRecipientFromDisposisi(User $user, Penjadwalan $penjadwalan): bool
    {
        if (!$penjadwalan->surat_masuk_id || !$penjadwalan->suratMasuk) {
            return false;
        }

        if ((int) $penjadwalan->dihadiri_oleh_user_id !== (int) $user->id) {
            return false;
        }

        return DisposisiSurat::query()
            ->where('surat_masuk_id', $penjadwalan->surat_masuk_id)
            ->where('ke_user_id', $user->id)
            ->exists();
    }
}
