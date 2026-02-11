<?php

namespace App\Policies;

use App\Models\Penjadwalan;
use App\Models\User;

class PenjadwalanPolicy
{
    /**
     * Determine if the user can access penjadwalan module.
     */
    private function canAccess(User $user): bool
    {
        return in_array($user->role, [
            User::ROLE_SUPERADMIN,
            User::ROLE_PIMPINAN,
            User::ROLE_TU,
        ], true);
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccess($user);
    }

    public function view(User $user, Penjadwalan $penjadwalan): bool
    {
        return $this->canAccess($user);
    }

    public function create(User $user): bool
    {
        return $this->canAccess($user);
    }

    public function update(User $user, Penjadwalan $penjadwalan): bool
    {
        return $this->canAccess($user);
    }

    public function delete(User $user, Penjadwalan $penjadwalan): bool
    {
        return $this->canAccess($user);
    }

    public function restore(User $user, Penjadwalan $penjadwalan): bool
    {
        return $this->canAccess($user);
    }

    public function forceDelete(User $user, Penjadwalan $penjadwalan): bool
    {
        return $this->canAccess($user);
    }
}
