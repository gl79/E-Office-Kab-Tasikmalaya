<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $tanggal_diterima
 * @property Carbon|null $tanggal_surat
 * @property Carbon|null $tanggal_diteruskan
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class SuratMasuk extends Model
{
    use HasFactory, HasUlids, SoftDeletes, HasAuditTrail;

    protected $table = 'surat_masuks';

    protected $fillable = [
        'nomor_agenda',
        'tanggal_diterima',
        'tanggal_surat',
        'asal_surat',
        'nomor_surat',
        'sifat',
        'lampiran',
        'perihal',
        'isi_ringkas',
        'jenis_surat_id',
        'indeks_berkas_id',
        'indeks_berkas_custom',
        'kode_klasifikasi_id',
        'staff_pengolah_id',
        'tanggal_diteruskan',
        'catatan_tambahan',
        'file_path',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'tanggal_diterima' => 'datetime',
        'tanggal_surat' => 'datetime',
        'tanggal_diteruskan' => 'datetime',
        'lampiran' => 'integer',
    ];

    /**
     * Konstanta untuk nilai sifat surat
     */
    public const SIFAT_BIASA = 'biasa';
    public const SIFAT_TERBATAS = 'terbatas';
    public const SIFAT_RAHASIA = 'rahasia';
    public const SIFAT_SANGAT_RAHASIA = 'sangat_rahasia';

    public const SIFAT_OPTIONS = [
        self::SIFAT_BIASA => 'Biasa',
        self::SIFAT_TERBATAS => 'Terbatas',
        self::SIFAT_RAHASIA => 'Rahasia',
        self::SIFAT_SANGAT_RAHASIA => 'Sangat Rahasia',
    ];

    /**
     * Generate nomor agenda otomatis dengan format SM/{number}/{year}.
     * Nomor di-generate per-user (setiap user punya urutan sendiri).
     * Nomor direset setiap pergantian tahun.
     */
    public static function generateNomorAgenda(string $userId): string
    {
        $year = date('Y');

        // Hitung dari tabel surat_masuk_tujuans (surat yang ditujukan ke user ini)
        $countFromTujuan = SuratMasukTujuan::where('tujuan_id', $userId)
            ->where('nomor_agenda', 'like', "SM/%/{$year}")
            ->get(['nomor_agenda'])
            ->map(fn($t) => (int) explode('/', $t->nomor_agenda)[1])
            ->max() ?? 0;

        // Hitung dari tabel surat_masuks (surat yang di-create oleh user ini)
        $countFromCreated = self::withTrashed()
            ->where('created_by', $userId)
            ->where('nomor_agenda', 'like', "SM/%/{$year}")
            ->get(['nomor_agenda'])
            ->map(fn($s) => (int) explode('/', $s->nomor_agenda)[1])
            ->max() ?? 0;

        $lastNumber = max($countFromTujuan, $countFromCreated);

        return 'SM/' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT) . '/' . $year;
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Relasi ke tabel tujuan surat (one to many)
     */
    public function tujuans(): HasMany
    {
        return $this->hasMany(SuratMasukTujuan::class, 'surat_masuk_id');
    }

    /**
     * Relasi ke tabel disposisi (one to many)
     */
    public function disposisis(): HasMany
    {
        return $this->hasMany(DisposisiSurat::class, 'surat_masuk_id');
    }

    /**
     * Relasi ke jenis surat
     */
    public function jenisSurat(): BelongsTo
    {
        return $this->belongsTo(JenisSurat::class, 'jenis_surat_id');
    }

    /**
     * Relasi ke indeks berkas (indeks_surat)
     */
    public function indeksBerkas(): BelongsTo
    {
        return $this->belongsTo(IndeksSurat::class, 'indeks_berkas_id');
    }

    /**
     * Relasi ke kode klasifikasi (indeks_surat)
     */
    public function kodeKlasifikasi(): BelongsTo
    {
        return $this->belongsTo(IndeksSurat::class, 'kode_klasifikasi_id');
    }

    /**
     * Relasi ke staff pengolah (users)
     */
    public function staffPengolah(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_pengolah_id');
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

    /**
     * Relasi ke penjadwalan (one to one)
     */
    public function penjadwalan(): HasOne
    {
        return $this->hasOne(Penjadwalan::class, 'surat_masuk_id');
    }

    /**
     * Cek apakah surat sudah dijadwalkan
     */
    public function hasPenjadwalan(): bool
    {
        return $this->penjadwalan()->exists();
    }

    // ==================== SCOPES ====================

    /**
     * Scope untuk filter berdasarkan pencarian
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('nomor_agenda', 'like', "%{$search}%")
                    ->orWhere('nomor_surat', 'like', "%{$search}%")
                    ->orWhere('asal_surat', 'like', "%{$search}%")
                    ->orWhere('perihal', 'like', "%{$search}%");
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
            $query->where('tanggal_diterima', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('tanggal_diterima', '<=', $endDate);
        }
        return $query;
    }

    /**
     * Scope untuk filter berdasarkan sifat
     */
    public function scopeFilterBySifat($query, ?string $sifat)
    {
        if ($sifat) {
            return $query->where('sifat', $sifat);
        }
        return $query;
    }

    /**
     * Scope untuk filter surat yang belum dijadwalkan
     */
    public function scopeBelumDijadwalkan($query)
    {
        return $query->whereDoesntHave('penjadwalan');
    }

    /**
     * Scope untuk filter surat yang sudah dijadwalkan
     */
    public function scopeSudahDijadwalkan($query)
    {
        return $query->whereHas('penjadwalan');
    }

    // ==================== ACCESSORS ====================

    /**
     * Get formatted sifat label
     */
    public function getSifatLabelAttribute(): string
    {
        return self::SIFAT_OPTIONS[$this->sifat] ?? $this->sifat;
    }

    /**
     * Get formatted tanggal diterima
     */
    public function getTanggalDiterimaFormattedAttribute(): string
    {
        return $this->tanggal_diterima?->format('d/m/Y') ?? '-';
    }

    /**
     * Get formatted tanggal surat
     */
    public function getTanggalSuratFormattedAttribute(): string
    {
        return $this->tanggal_surat?->format('d/m/Y') ?? '-';
    }

    /**
     * Get list tujuan as array
     */
    public function getTujuanListAttribute(): array
    {
        return $this->tujuans->pluck('tujuan')->toArray();
    }
}
