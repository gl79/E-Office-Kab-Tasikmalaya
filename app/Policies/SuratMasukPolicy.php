<?php

namespace App\Policies;

use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
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
     * Determine whether Bupati / Wakil Bupati / Sekda can open scheduling form for this surat.
     */
    public function scheduleByBupati(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->isBupati() && !$user->isWakilBupati() && !$user->isSekda()) {
            return false;
        }

        return $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->where('status_penerimaan', SuratMasukTujuan::STATUS_DITERIMA)
            ->exists();
    }

    /**
     * Determine whether delegated user can finalize tentative schedule.
     */
    public function finalizeDelegatedJadwal(User $user, SuratMasuk $suratMasuk): bool
    {
        return false;
    }

    /**
     * Determine whether recipient can accept surat (Bupati / Wakil / Sekda only).
     */
    public function acceptByRecipient(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $isEligible = $user->isBupati() || $user->isWakilBupati() || $user->isSekda();

        if (!$isEligible) {
            return false;
        }

        return $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether Bupati / Wakil Bupati / Sekda can create disposisi.
     */
    public function disposisiByBupati(User $user, SuratMasuk $suratMasuk): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->isBupati() && !$user->isWakilBupati() && !$user->isSekda()) {
            return false;
        }

        return $suratMasuk->tujuans()
            ->where('tujuan_id', $user->id)
            ->where('status_penerimaan', SuratMasukTujuan::STATUS_DITERIMA)
            ->exists();
    }
}
