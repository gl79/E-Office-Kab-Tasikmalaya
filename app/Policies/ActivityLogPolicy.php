<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogPolicy
{
    /**
     * Determine whether the user can view any models.
     * Only superadmin can view activity logs.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can view the model.
     * Only superadmin can view activity logs.
     */
    public function view(User $user, ActivityLog $activityLog): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can create models.
     * Activity logs are created by the system, not users.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     * Activity logs should not be updated.
     */
    public function update(User $user, ActivityLog $activityLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     * Only superadmin can delete activity logs.
     */
    public function delete(User $user, ActivityLog $activityLog): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     * Activity logs don't use soft deletes.
     */
    public function restore(User $user, ActivityLog $activityLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only superadmin can permanently delete activity logs.
     */
    public function forceDelete(User $user, ActivityLog $activityLog): bool
    {
        return $user->isSuperAdmin();
    }
}
