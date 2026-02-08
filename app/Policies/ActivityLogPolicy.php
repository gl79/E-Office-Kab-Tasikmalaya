<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogPolicy
{
    /**
     * Determine whether the user can view any models.
     * All authenticated users can view activity logs (their own, or all if superadmin).
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can access
    }

    /**
     * Determine whether the user can view the model.
     * Users can view their own logs, superadmin can view all logs.
     */
    public function view(User $user, ActivityLog $activityLog): bool
    {
        return $user->isSuperAdmin() || $activityLog->user_id === $user->id;
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
