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
 *
 * Computed properties (set dynamically in controller for API response)
 * @property string|null $penerimaan_status
 * @property string|null $penerimaan_diterima_at
 * @property bool $can_accept
 * @property bool $can_disposisi
 * @property bool $can_disposisi_disabled
 * @property bool $can_schedule
 * @property bool $can_finalize_schedule
 * @property bool $can_view_schedule
 * @property string $penjadwalan_status
 * @property string $penjadwalan_status_label
 * @property string $penjadwalan_status_variant
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

        // Kumpulkan semua nomor agenda yang masih aktif (tidak dihapus) untuk user ini
        // Dari tabel surat_masuk_tujuans (surat yang ditujukan ke user ini, parent tidak dihapus)
        $tujuanNumbers = SuratMasukTujuan::where('tujuan_id', $userId)
            ->where('nomor_agenda', 'like', "SM/%/{$year}")
            ->whereHas('suratMasuk', fn($q) => $q->whereNull('deleted_at'))
            ->pluck('nomor_agenda')
            ->map(fn($agenda) => (int) explode('/', $agenda)[1]);

        // Dari tabel surat_masuks (surat yang di-create oleh user ini, tidak dihapus)
        $createdNumbers = self::where('created_by', $userId)
            ->where('nomor_agenda', 'like', "SM/%/{$year}")
            ->pluck('nomor_agenda')
            ->map(fn($agenda) => (int) explode('/', $agenda)[1]);

        $existingNumbers = $tujuanNumbers->merge($createdNumbers)->unique()->sort()->values();

        // Cari nomor pertama yang tersedia (isi gap yang kosong)
        $nextNumber = 1;
        while ($existingNumbers->contains($nextNumber)) {
            $nextNumber++;
        }

        return 'SM/' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT) . '/' . $year;
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
        return SifatSurat::getOptions()[$this->sifat] ?? $this->sifat;
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
