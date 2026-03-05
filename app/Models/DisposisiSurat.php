<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model untuk rantai disposisi surat masuk.
 *
 * @property string $id
 * @property string $surat_masuk_id
 * @property int $dari_user_id
 * @property int $ke_user_id
 * @property string|null $catatan
 * @property \Illuminate\Support\Carbon|null $dibaca_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class DisposisiSurat extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'disposisi_surat';

    protected $fillable = [
        'surat_masuk_id',
        'dari_user_id',
        'ke_user_id',
        'catatan',
        'dibaca_at',
    ];

    protected $casts = [
        'dibaca_at' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Relasi ke surat masuk
     */
    public function suratMasuk(): BelongsTo
    {
        return $this->belongsTo(SuratMasuk::class, 'surat_masuk_id');
    }

    /**
     * User yang mengirim disposisi
     */
    public function dariUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dari_user_id');
    }

    /**
     * User yang menerima disposisi
     */
    public function keUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ke_user_id');
    }

    // ==================== HELPERS ====================

    /**
     * Cek apakah disposisi sudah dibaca oleh penerima.
     */
    public function isRead(): bool
    {
        return $this->dibaca_at !== null;
    }

    /**
     * Tandai disposisi sebagai sudah dibaca.
     */
    public function markAsRead(): void
    {
        if (!$this->isRead()) {
            $this->update(['dibaca_at' => now()]);
        }
    }
}
