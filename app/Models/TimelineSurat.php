<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model untuk timeline/riwayat aksi pada surat masuk.
 *
 * @property string $id
 * @property string $surat_masuk_id
 * @property int|null $user_id
 * @property string $aksi
 * @property string $keterangan
 * @property \Illuminate\Support\Carbon|null $created_at
 */
class TimelineSurat extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'timeline_surat';
    public $timestamps = false;

    protected $fillable = [
        'surat_masuk_id',
        'user_id',
        'aksi',
        'keterangan',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Konstanta aksi yang tersedia.
     */
    public const AKSI_INPUT = 'input';
    public const AKSI_KIRIM = 'kirim';
    public const AKSI_BACA = 'baca';
    public const AKSI_TERIMA = 'terima';
    public const AKSI_DISPOSISI = 'disposisi';
    public const AKSI_JADWALKAN = 'jadwalkan';
    public const AKSI_DEFINITIF = 'definitif';

    public const AKSI_OPTIONS = [
        self::AKSI_INPUT => 'Surat Diinput',
        self::AKSI_KIRIM => 'Surat Dikirim',
        self::AKSI_BACA => 'Surat Dibaca',
        self::AKSI_TERIMA => 'Surat Diterima/Diketahui',
        self::AKSI_DISPOSISI => 'Surat Didisposisi',
        self::AKSI_JADWALKAN => 'Kegiatan Dijadwalkan',
        self::AKSI_DEFINITIF => 'Jadwal Dijadikan Definitif',
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
     * Relasi ke user yang melakukan aksi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // ==================== STATIC HELPERS ====================

    /**
     * Catat timeline surat masuk.
     */
    public static function record(string $suratMasukId, ?int $userId, string $aksi, string $keterangan): self
    {
        return self::create([
            'surat_masuk_id' => $suratMasukId,
            'user_id' => $userId,
            'aksi' => $aksi,
            'keterangan' => $keterangan,
            'created_at' => now(),
        ]);
    }

    // ==================== ACCESSORS ====================

    /**
     * Get label aksi yang human-readable.
     */
    public function getAksiLabelAttribute(): string
    {
        return self::AKSI_OPTIONS[$this->aksi] ?? $this->aksi;
    }
}
