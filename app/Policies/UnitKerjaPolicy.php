<?php

namespace App\Policies;

use App\Models\UnitKerja;
use App\Models\User;

class UnitKerjaPolicy
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
    public function view(User $user, UnitKerja $unitKerja): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     * Only superadmin and TU can create.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can update the model.
     * Only superadmin and TU can update.
     */
    public function update(User $user, UnitKerja $unitKerja): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can delete the model.
     * Only superadmin and TU can delete.
     */
    public function delete(User $user, UnitKerja $unitKerja): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can restore the model.
     * Only superadmin and TU can restore.
     */
    public function restore(User $user, UnitKerja $unitKerja): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only superadmin and TU can force delete.
     */
    public function forceDelete(User $user, UnitKerja $unitKerja): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }
}
