<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisposisiSurat extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'disposisi_surat';

    protected $fillable = [
        'surat_masuk_id',
        'penanda_tangan',
        'jabatan_penanda_tangan',
        'tujuan_disposisi',
        'instruksi',
        'tanggal_disposisi',
        'created_by',
    ];

    protected $casts = [
        'tanggal_disposisi' => 'date',
    ];

    /**
     * Konstanta untuk penanda tangan default
     */
    public const PENANDA_TANGAN_OPTIONS = [
        [
            'nama' => 'H. Cecep Nurul Yakin, S.Pd., M.A.P.',
            'jabatan' => 'Bupati',
        ],
        [
            'nama' => 'H. Asep Sopari Al-Ayubi S.P., M.I.P.',
            'jabatan' => 'Wakil Bupati',
        ],
        [
            'nama' => 'Drs. H. Roni Ahmad Sahroni, MM.',
            'jabatan' => 'Sekretaris Daerah',
        ],
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
     * Relasi ke user yang membuat disposisi
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ==================== ACCESSORS ====================

    /**
     * Get formatted tanggal disposisi
     */
    public function getTanggalDisposisiFormattedAttribute(): string
    {
        return $this->tanggal_disposisi?->format('d/m/Y') ?? '-';
    }
}
