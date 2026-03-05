<?php

namespace App\Policies;

use App\Models\Penjadwalan;
use App\Models\User;

class PenjadwalanPolicy
{
    /**
     * Cek akses ke modul penjadwalan.
     */
    private function canAccess(User $user): bool
    {
        return in_array($user->role, [
            User::ROLE_SUPERADMIN,
            User::ROLE_PEJABAT,
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

    /**
     * Update: bisa jika belum definitif, atau jika user adalah pemilik jadwal.
     */
    public function update(User $user, Penjadwalan $penjadwalan): bool
    {
        if (!$this->canAccess($user)) {
            return false;
        }

        // Setelah definitif, hanya pemilik jadwal atau superadmin yang bisa update
        if ($penjadwalan->isLockedDefinitif()) {
            return $user->isSuperAdmin()
                || ($penjadwalan->pemilik_jadwal_id && $penjadwalan->pemilik_jadwal_id === $user->id);
        }

        return true;
    }

    /**
     * Finalize: hanya pemilik jadwal atau superadmin yang bisa mengubah
     * status dari tentatif ke definitif.
     */
    public function finalize(User $user, Penjadwalan $penjadwalan): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$this->canAccess($user)) {
            return false;
        }

        // Hanya pemilik jadwal yang bisa finalize
        return $penjadwalan->pemilik_jadwal_id !== null
            && $penjadwalan->pemilik_jadwal_id === $user->id;
    }

    public function delete(User $user, Penjadwalan $penjadwalan): bool
    {
        if (!$this->canAccess($user)) {
            return false;
        }

        // Setelah definitif, hanya superadmin yang bisa hapus
        if ($penjadwalan->isLockedDefinitif()) {
            return $user->isSuperAdmin();
        }

        return true;
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
