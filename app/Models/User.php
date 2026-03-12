<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
 * @property int|null $jabatan_id
 * @property array|null $module_access
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $password_changed_at
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string|null $foto_url
 * @property-read string $role_label
 * @property-read string|null $jabatan_nama
 * @property-read Jabatan|null $jabatanRelasi
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Role Constants — hanya untuk hak akses sistem.
     */
    public const ROLE_SUPERADMIN = 'superadmin';
    public const ROLE_TU = 'tu';
    public const ROLE_PEJABAT = 'pejabat';
    public const ROLE_USER = 'user';

    /**
     * Available roles
     */
    public const ROLES = [
        self::ROLE_SUPERADMIN,
        self::ROLE_TU,
        self::ROLE_PEJABAT,
        self::ROLE_USER,
    ];

    /**
     * Role labels for display
     */
    public const ROLE_LABELS = [
        self::ROLE_SUPERADMIN => 'Super Admin',
        self::ROLE_TU => 'Tata Usaha',
        self::ROLE_PEJABAT => 'Pejabat',
        self::ROLE_USER => 'User',
    ];

    /**
     * Available modules for access control
     */
    public const MODULES = [
        'dashboard' => 'Dashboard',
        'master.pengguna' => 'Data Master - Pengguna',
        'master.jabatans' => 'Data Master - Jabatan',
        'master.unit-kerja' => 'Data Master - Unit Kerja',
        'master.indeks-surat' => 'Data Master - Indeks Surat',
        'master.sifat-surat' => 'Data Master - Sifat Surat',
        'persuratan.surat-masuk' => 'Persuratan - Surat Masuk',
        'persuratan.surat-keluar' => 'Persuratan - Surat Keluar',
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
        'plain_password',
        'role',
        'foto',
        'nip',
        'jenis_kelamin',
        'jabatan_id',
        'module_access',
        'created_by',
        'password_changed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'plain_password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'foto_url',
        'role_label',
        'jabatan_nama',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'plain_password' => 'encrypted',
            'module_access' => 'array',
            'password_changed_at' => 'datetime',
            'jabatan_id' => 'integer',
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Relasi ke jabatan struktural.
     */
    public function jabatanRelasi(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class, 'jabatan_id');
    }

    /**
     * Get the user who created this user.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ==================== ACCESSORS ====================

    /**
     * Get the display label for the user's role.
     */
    public function getRoleLabelAttribute(): string
    {
        if (empty($this->role)) {
            return '-';
        }
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
     * Get nama jabatan dari relasi.
     */
    public function getJabatanNamaAttribute(): ?string
    {
        return $this->jabatanRelasi?->nama;
    }

    // ==================== ROLE CHECKS ====================

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
     * Check if user is Pejabat.
     */
    public function isPejabat(): bool
    {
        return $this->role === self::ROLE_PEJABAT;
    }

    /**
     * Check if user is TU.
     */
    public function isTU(): bool
    {
        return $this->role === self::ROLE_TU;
    }

    /**
     * Check if user is User role.
     */
    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    /**
     * Check if user can manage users (superadmin or TU).
     */
    public function canManageUsers(): bool
    {
        return $this->isSuperAdmin() || $this->isTU();
    }

    // ==================== JABATAN / DISPOSISI CHECKS ====================

    /**
     * Get level jabatan user (null jika tidak punya jabatan).
     */
    public function getJabatanLevel(): ?int
    {
        return $this->jabatanRelasi?->level;
    }

    /**
     * Cek apakah user ini bisa melakukan disposisi.
     * Berdasarkan jabatan.can_dispose.
     */
    public function canDispose(): bool
    {
        if ($this->isSuperAdmin() || $this->isUser()) {
            return false;
        }

        $level = $this->getJabatanLevel();

        // Level jabatan 1 s.d 5 dapat disposisi (tetap mengikuti flag can_dispose).
        // Level 6 ke atas hanya menerima disposisi.
        if ($level === null || $level > 5) {
            return false;
        }

        return (bool) $this->jabatanRelasi?->can_dispose;
    }

    /**
     * Cek apakah user tujuan surat wajib melakukan aksi terima/diketahui.
     * TU tidak wajib manual accept karena berperan sebagai pengelola administrasi.
     */
    public function requiresSuratAcceptance(): bool
    {
        if ($this->isSuperAdmin() || $this->isTU()) {
            return false;
        }

        return true;
    }

    /**
     * Cek apakah user adalah level 1 (Bupati, Wakil Bupati, Sekda).
     */
    public function isLevelOne(): bool
    {
        return $this->getJabatanLevel() === 1;
    }

    /**
     * Cek apakah user bisa memonitoring semua jadwal (Super Admin, TU, atau level 1-3).
     */
    public function canMonitorAllSchedules(): bool
    {
        if ($this->isUser()) {
            return false;
        }

        if ($this->isSuperAdmin() || $this->isTU()) {
            return true;
        }

        $level = $this->getJabatanLevel();
        // Level 1-3 (Bupati, Wakil Bupati, Sekda) berhak memantau semua.
        if ($level !== null && in_array($level, [1, 2, 3], true)) {
            return true;
        }

        $jabatanNama = strtolower((string) $this->jabatan_nama);
        return str_contains($jabatanNama, 'sekretaris daerah');
    }

    /**
     * Cek apakah user ini bisa disposisi ke user target.
     * User hanya dapat disposisi ke jabatan dengan level lebih besar (lebih rendah).
     */
    public function canDisposeToUser(User $target): bool
    {
        if (!$this->canDispose()) {
            return false;
        }

        $myLevel = $this->getJabatanLevel();
        $targetLevel = $target->getJabatanLevel();

        if ($myLevel === null || $targetLevel === null) {
            return false;
        }

        return $myLevel < $targetLevel;
    }

    // ==================== MODULE ACCESS ====================

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

    // ==================== SCOPES ====================

    /**
     * Scope: Selectable users for dropdowns (non-superadmin, ordered by jabatan level then name).
     * Consolidates the duplicated user query pattern from controllers.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $columns Columns to select (default: id, name, nip, jabatan_id)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSelectableUsers($query, array $columns = ['id', 'name', 'nip', 'jabatan_id'])
    {
        return $query
            ->select($columns)
            ->with('jabatanRelasi:id,nama,level')
            ->where('role', '!=', self::ROLE_SUPERADMIN)
            ->leftJoin('jabatans', 'users.jabatan_id', '=', 'jabatans.id')
            ->orderBy('jabatans.level')
            ->orderBy('users.name')
            ->select($columns); // re-select after join
    }
}
