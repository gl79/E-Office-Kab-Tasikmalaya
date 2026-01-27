<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Role Constants
     */
    public const ROLE_SUPERADMIN = 'superadmin';
    public const ROLE_TU = 'tu';
    public const ROLE_SEKPRI_BUPATI = 'sekpri_bupati';
    public const ROLE_SEKPRI_WAKIL_BUPATI = 'sekpri_wakil_bupati';

    /**
     * Available roles
     */
    public const ROLES = [
        self::ROLE_SUPERADMIN,
        self::ROLE_TU,
        self::ROLE_SEKPRI_BUPATI,
        self::ROLE_SEKPRI_WAKIL_BUPATI,
    ];

    /**
     * Role labels for display
     */
    public const ROLE_LABELS = [
        self::ROLE_SUPERADMIN => 'Super Admin',
        self::ROLE_TU => 'Tata Usaha',
        self::ROLE_SEKPRI_BUPATI => 'Sekpri Bupati',
        self::ROLE_SEKPRI_WAKIL_BUPATI => 'Sekpri Wakil Bupati',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the display label for the user's role.
     */
    public function getRoleLabelAttribute(): string
    {
        return self::ROLE_LABELS[$this->role] ?? $this->role;
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is superadmin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPERADMIN;
    }
}
