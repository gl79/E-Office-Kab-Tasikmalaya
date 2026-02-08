<?php

namespace App\Policies;

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
     * All authenticated users can view.
     */
    public function view(User $user, SuratMasuk $suratMasuk): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     * Superadmin, TU, and Sekpri can create.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isTU() || $user->isSekpri();
    }

    /**
     * Determine whether the user can update the model.
     * Superadmin, TU, and Sekpri can update.
     */
    public function update(User $user, SuratMasuk $suratMasuk): bool
    {
        return $user->isSuperAdmin() || $user->isTU() || $user->isSekpri();
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
}
