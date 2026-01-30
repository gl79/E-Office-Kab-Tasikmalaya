<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WilayahDesa;

class WilayahDesaPolicy
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
    public function view(User $user, WilayahDesa $wilayahDesa): bool
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
    public function update(User $user, WilayahDesa $wilayahDesa): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can delete the model.
     * Only superadmin and TU can delete.
     */
    public function delete(User $user, WilayahDesa $wilayahDesa): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can restore the model.
     * Only superadmin and TU can restore.
     */
    public function restore(User $user, WilayahDesa $wilayahDesa): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only superadmin and TU can force delete.
     */
    public function forceDelete(User $user, WilayahDesa $wilayahDesa): bool
    {
        return $user->isSuperAdmin() || $user->isTU();
    }
}
