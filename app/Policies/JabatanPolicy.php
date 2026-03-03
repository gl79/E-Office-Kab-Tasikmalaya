<?php

namespace App\Policies;

use App\Models\Jabatan;
use App\Models\User;

class JabatanPolicy
{
    /**
     * Hanya Super Admin yang dapat mengelola jabatan.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, Jabatan $jabatan): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Jabatan $jabatan): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, Jabatan $jabatan): bool
    {
        return $user->isSuperAdmin();
    }
}
