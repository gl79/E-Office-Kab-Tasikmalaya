<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $nama
 * @property int $level
 * @property bool $can_dispose
 * @property bool $is_system
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class Jabatan extends Model
{
    use HasFactory;

    protected $table = 'jabatans';

    protected $fillable = [
        'nama',
        'level',
        'can_dispose',
        'is_system',
    ];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'can_dispose' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Relasi ke users yang memiliki jabatan ini.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'jabatan_id');
    }

    // ==================== SCOPES ====================

    /**
     * Scope: urutkan berdasarkan level (ascending = tertinggi dulu).
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('level')->orderBy('nama');
    }

    /**
     * Scope: hanya jabatan yang bisa melakukan disposisi.
     */
    public function scopeCanDispose($query)
    {
        return $query->where('can_dispose', true);
    }

    // ==================== HELPERS ====================

    /**
     * Cek apakah jabatan ini adalah level tertinggi (level 1).
     */
    public function isTopLevel(): bool
    {
        return $this->level === 1;
    }

    /**
     * Cek apakah jabatan ini sedang digunakan oleh user.
     */
    public function isUsedByUsers(): bool
    {
        return $this->users()->exists();
    }
}
