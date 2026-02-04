<?php

namespace App\Policies;

use App\Models\Cuti;
use App\Models\User;

class CutiPolicy
{
    /**
     * Determine if the user can access cuti module.
     */
    private function canAccess(User $user): bool
    {
        return in_array($user->role, [
            User::ROLE_SUPERADMIN,
            User::ROLE_TU,
        ], true);
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccess($user);
    }

    public function view(User $user, Cuti $cuti): bool
    {
        return $this->canAccess($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccess($user);
    }

    public function update(User $user, Cuti $cuti): bool
    {
        return $this->canAccess($user);
    }

    public function delete(User $user, Cuti $cuti): bool
    {
        return $this->canAccess($user);
    }

    public function restore(User $user, Cuti $cuti): bool
    {
        return $this->canAccess($user);
    }

    public function forceDelete(User $user, Cuti $cuti): bool
    {
        return $this->canAccess($user);
    }

    public function cancel(User $user, Cuti $cuti): bool
    {
        return $this->canAccess($user);
    }

    public function approve(User $user, Cuti $cuti): bool
    {
        return $this->canAccess($user);
    }

    public function reject(User $user, Cuti $cuti): bool
    {
        return $this->canAccess($user);
    }
}
