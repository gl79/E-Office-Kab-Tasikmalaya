<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * @property int $id
 * @property string $name
 * @property string $username
 * @property string $role
 * @property string|null $email
 * @property string $password
 * @property string|null $foto
 * @property string|null $nip
 * @property string|null $jenis_kelamin
 * @property string|null $jabatan
 * @property array|null $module_access
 * @property \Illuminate\Support\Carbon|null $password_changed_at
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read string|null $foto_url
 * @property-read string $role_label
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

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
     * Available modules for access control
     */
    public const MODULES = [
        'dashboard' => 'Dashboard',
        'master.kepegawaian' => 'Data Master - Kepegawaian',
        'master.pengguna' => 'Data Master - Pengguna',
        'master.unit-kerja' => 'Data Master - Unit Kerja',
        'master.indeks-surat' => 'Data Master - Indeks Surat',
        'persuratan.surat-masuk' => 'Persuratan - Surat Masuk',
        'persuratan.surat-keluar' => 'Persuratan - Surat Keluar',
        'cuti' => 'Cuti',
        'penjadwalan.jadwal' => 'Penjadwalan - Jadwal',
        'penjadwalan.tentatif' => 'Penjadwalan - Tentatif',
        'penjadwalan.definitif' => 'Penjadwalan - Definitif',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'foto',
        'nip',
        'jenis_kelamin',
        'jabatan',
        'module_access',
        'password_changed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'foto_url',
        'role_label',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'module_access' => 'array',
            'password_changed_at' => 'datetime',
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
     * Get foto URL attribute
     */
    public function getFotoUrlAttribute(): ?string
    {
        if ($this->foto) {
            return asset('storage/' . $this->foto);
        }
        return null;
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

    /**
     * Check if user is TU.
     */
    public function isTU(): bool
    {
        return $this->role === self::ROLE_TU;
    }

    /**
     * Check if user can manage users (superadmin or TU).
     */
    public function canManageUsers(): bool
    {
        return $this->isSuperAdmin() || $this->isTU();
    }

    /**
     * Check if user has access to a specific module.
     */
    public function hasModuleAccess(string $module): bool
    {
        // Superadmin has access to all modules
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Check module_access array
        $access = $this->module_access ?? [];
        return in_array($module, $access);
    }
}
