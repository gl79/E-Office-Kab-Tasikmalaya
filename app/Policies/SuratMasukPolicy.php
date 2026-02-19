<?php

namespace App\Policies;

use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\User;

class SuratMasukPolicy
{
    /**
     * Determine whether the user can view any models.
     * All authenticated users can view.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Superadmin, TU, and Pimpinan can view all.
     * Regular users can only view letters where they are recipients.
     */
    public function view(User $user, SuratMasuk $suratMasuk): bool
    {
        // Superadmin, TU, and Pimpinan can view all letters
        if ($user->isSuperAdmin() || $user->isTU() || $user->isPimpinan()) {
            return true;
        }

        // Regular users can only view if they are in tujuans list
        return $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can create models.
     * Only Superadmin and TU can create.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can update the model.
     * Only Superadmin and TU can update.
     */
    public function update(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can delete the model.
     * Only superadmin and TU can delete.
     */
    public function delete(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can restore the model.
     * Only superadmin and TU can restore.
     */
    public function restore(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only superadmin and TU can force delete.
     */
    public function forceDelete(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether Bupati can open scheduling form for this surat.
     */
    public function scheduleByBupati(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->isBupati()) {
            return false;
        }

        return $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether delegated user can finalize tentative schedule.
     */
    public function finalizeDelegatedJadwal(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $jadwal = $suratMasuk->relationLoaded('penjadwalan')
            ? $suratMasuk->penjadwalan
            : $suratMasuk->penjadwalan()->first();

        if (!$jadwal) {
            return false;
        }

        return $jadwal->status === Penjadwalan::STATUS_TENTATIF
            && (int) $jadwal->dihadiri_oleh_user_id === (int) $user->id;
    }
}
