<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SuratKeluar extends Model
{
    use HasFactory, HasUlids, SoftDeletes, HasAuditTrail;

    protected $table = 'surat_keluars';

    protected $fillable = [
        'tanggal_surat',
        'no_urut',
        'nomor_surat',
        'kepada',
        'perihal',
        'isi_ringkas',
        'sifat_1',
        'sifat_2',
        'indeks_id',
        'kode_klasifikasi_id',
        'unit_kerja_id',
        'kode_pengolah',
        'lampiran',
        'catatan',
        'file_path',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'tanggal_surat' => 'datetime',
        'lampiran' => 'integer',
    ];

    /**
     * Konstanta untuk nilai sifat 1 (klasifikasi keamanan)
     */
    public const SIFAT_1_BIASA = 'biasa';
    public const SIFAT_1_TERBATAS = 'terbatas';
    public const SIFAT_1_RAHASIA = 'rahasia';
    public const SIFAT_1_SANGAT_RAHASIA = 'sangat_rahasia';

    public const SIFAT_1_OPTIONS = [
        self::SIFAT_1_BIASA => 'Biasa',
        self::SIFAT_1_TERBATAS => 'Terbatas',
        self::SIFAT_1_RAHASIA => 'Rahasia',
        self::SIFAT_1_SANGAT_RAHASIA => 'Sangat Rahasia',
    ];

    /**
     * Konstanta untuk nilai sifat 2 (urgensi)
     */
    public const SIFAT_2_BIASA = 'biasa';
    public const SIFAT_2_PENTING = 'penting';
    public const SIFAT_2_SEGERA = 'segera';
    public const SIFAT_2_AMAT_SEGERA = 'amat_segera';

    public const SIFAT_2_OPTIONS = [
        self::SIFAT_2_BIASA => 'Biasa',
        self::SIFAT_2_PENTING => 'Penting',
        self::SIFAT_2_SEGERA => 'Segera',
        self::SIFAT_2_AMAT_SEGERA => 'Amat Segera',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Relasi ke indeks surat
     */
    public function indeks(): BelongsTo
    {
        return $this->belongsTo(IndeksSurat::class, 'indeks_id');
    }

    /**
     * Relasi ke kode klasifikasi (indeks_surat)
     */
    public function kodeKlasifikasi(): BelongsTo
    {
        return $this->belongsTo(IndeksSurat::class, 'kode_klasifikasi_id');
    }

    /**
     * Relasi ke unit kerja
     */
    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_kerja_id');
    }

    /**
     * Relasi ke user yang membuat record
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke user yang update record
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relasi ke user yang delete record
     */
    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    // ==================== SCOPES ====================

    /**
     * Scope untuk filter berdasarkan pencarian
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                  ->orWhere('kepada', 'like', "%{$search}%")
                  ->orWhere('perihal', 'like', "%{$search}%")
                  ->orWhere('no_urut', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    /**
     * Scope untuk filter berdasarkan tanggal
     */
    public function scopeFilterByDate($query, ?string $startDate, ?string $endDate)
    {
        if ($startDate) {
            $query->where('tanggal_surat', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('tanggal_surat', '<=', $endDate);
        }
        return $query;
    }

    /**
     * Scope untuk filter berdasarkan sifat
     */
    public function scopeFilterBySifat1($query, ?string $sifat)
    {
        if ($sifat) {
            return $query->where('sifat_1', $sifat);
        }
        return $query;
    }

    /**
     * Scope untuk filter berdasarkan sifat 2
     */
    public function scopeFilterBySifat2($query, ?string $sifat)
    {
        if ($sifat) {
            return $query->where('sifat_2', $sifat);
        }
        return $query;
    }

    // ==================== ACCESSORS ====================

    /**
     * Get formatted sifat 1 label
     */
    public function getSifat1LabelAttribute(): string
    {
        return self::SIFAT_1_OPTIONS[$this->sifat_1] ?? $this->sifat_1;
    }

    /**
     * Get formatted sifat 2 label
     */
    public function getSifat2LabelAttribute(): string
    {
        return self::SIFAT_2_OPTIONS[$this->sifat_2] ?? $this->sifat_2;
    }

    /**
     * Get formatted tanggal surat
     */
    public function getTanggalSuratFormattedAttribute(): string
    {
        return $this->tanggal_surat?->format('d/m/Y') ?? '-';
    }
}
