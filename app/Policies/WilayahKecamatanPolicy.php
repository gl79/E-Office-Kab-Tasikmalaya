<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WilayahKecamatan;

class WilayahKecamatanPolicy
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
    public function view(User $user, WilayahKecamatan $wilayahKecamatan): bool
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
    public function update(User $user, WilayahKecamatan $wilayahKecamatan): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can delete the model.
     * Only superadmin and TU can delete.
     */
    public function delete(User $user, WilayahKecamatan $wilayahKecamatan): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can restore the model.
     * Only superadmin and TU can restore.
     */
    public function restore(User $user, WilayahKecamatan $wilayahKecamatan): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only superadmin and TU can force delete.
     */
    public function forceDelete(User $user, WilayahKecamatan $wilayahKecamatan): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }
}
