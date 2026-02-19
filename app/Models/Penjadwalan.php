<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property string|null $surat_masuk_id
 * @property string|null $nama_kegiatan
 * @property string|null $lokasi_type
 * @property string|null $kode_wilayah
 * @property string|null $tempat
 * @property string|null $status
 * @property string|null $status_disposisi
 * @property string|null $dihadiri_oleh
 * @property int|null $dihadiri_oleh_user_id
 * @property string|null $keterangan
 * @property string|null $waktu_mulai
 * @property string|null $waktu_selesai
 * @property bool $sampai_selesai
 * @property string|null $created_by
 * @property string|null $updated_by
 * @property string|null $deleted_by
 * @property Carbon|null $tanggal_agenda
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 *
 * @property-read string $waktu_lengkap
 * @property-read string $tanggal_format_indonesia
 * @property-read string $tanggal_formatted
 * @property-read string $status_label
 * @property-read string $status_disposisi_label
 * @property-read string $lokasi_type_label
 * @property-read string $hari
 */
class Penjadwalan extends Model
{
    use HasFactory, HasUlids, SoftDeletes, HasAuditTrail;

    protected $table = 'penjadwalan';

    protected $fillable = [
        'surat_masuk_id',
        'tanggal_agenda',
        'waktu_mulai',
        'waktu_selesai',
        'sampai_selesai',
        'nama_kegiatan',
        'lokasi_type',
        'kode_wilayah',
        'tempat',
        'status',
        'status_disposisi',
        'dihadiri_oleh',
        'dihadiri_oleh_user_id',
        'keterangan',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'tanggal_agenda' => 'datetime',
        'sampai_selesai' => 'boolean',
        'dihadiri_oleh_user_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Konstanta untuk status
     */
    public const STATUS_TENTATIF = 'tentatif';
    public const STATUS_DEFINITIF = 'definitif';

    public const STATUS_OPTIONS = [
        self::STATUS_TENTATIF => 'Tentatif',
        self::STATUS_DEFINITIF => 'Definitif',
    ];

    /**
     * Konstanta untuk label status formal pemerintahan (derived, non-breaking).
     */
    public const STATUS_FORMAL_TERJADWAL = 'terjadwal';
    public const STATUS_FORMAL_DALAM_PROSES = 'dalam_proses';
    public const STATUS_FORMAL_DIDISPOSISIKAN = 'didisposisikan';
    public const STATUS_FORMAL_SELESAI = 'selesai';
    public const STATUS_FORMAL_DITUNDA = 'ditunda';
    public const STATUS_FORMAL_DIBATALKAN = 'dibatalkan';

    public const STATUS_FORMAL_OPTIONS = [
        self::STATUS_FORMAL_TERJADWAL => 'Terjadwal',
        self::STATUS_FORMAL_DALAM_PROSES => 'Dalam Proses',
        self::STATUS_FORMAL_DIDISPOSISIKAN => 'Didisposisikan',
        self::STATUS_FORMAL_SELESAI => 'Selesai',
        self::STATUS_FORMAL_DITUNDA => 'Ditunda',
        self::STATUS_FORMAL_DIBATALKAN => 'Dibatalkan',
    ];

    /**
     * Konstanta untuk status disposisi
     */
    public const DISPOSISI_MENUNGGU = 'menunggu';
    public const DISPOSISI_BUPATI = 'bupati';
    public const DISPOSISI_WAKIL_BUPATI = 'wakil_bupati';
    public const DISPOSISI_DIWAKILKAN = 'diwakilkan';

    public const DISPOSISI_OPTIONS = [
        self::DISPOSISI_MENUNGGU => 'Menunggu',
        self::DISPOSISI_BUPATI => 'Bupati',
        self::DISPOSISI_WAKIL_BUPATI => 'Wakil Bupati',
        self::DISPOSISI_DIWAKILKAN => 'Diwakilkan',
    ];

    /**
     * Konstanta untuk lokasi type
     */
    public const LOKASI_DALAM_DAERAH = 'dalam_daerah';
    public const LOKASI_LUAR_DAERAH = 'luar_daerah';

    public const LOKASI_TYPE_OPTIONS = [
        self::LOKASI_DALAM_DAERAH => 'Dalam Daerah',
        self::LOKASI_LUAR_DAERAH => 'Luar Daerah',
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
     * Relasi ke user yang membuat record
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke user yang update record
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relasi ke user yang delete record
     */
    public function deleter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    /**
     * Relasi ke user yang ditunjuk untuk menghadiri.
     */
    public function dihadiriOlehUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dihadiri_oleh_user_id');
    }

    /**
     * Relasi riwayat perubahan jadwal.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(JadwalHistory::class, 'jadwal_id')->latest('created_at');
    }

    // ==================== SCOPES ====================

    /**
     * Scope untuk filter agenda tentatif
     */
    public function scopeTentatif(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_TENTATIF);
    }

    /**
     * Scope untuk filter agenda definitif
     */
    public function scopeDefinitif(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DEFINITIF);
    }

    /**
     * Scope untuk filter menunggu peninjauan
     */
    public function scopeMenungguPeninjauan(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_TENTATIF)
            ->where('status_disposisi', self::DISPOSISI_MENUNGGU);
    }

    /**
     * Scope untuk filter sudah ditinjau
     */
    public function scopeSudahDitinjau(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_TENTATIF)
            ->whereIn('status_disposisi', [self::DISPOSISI_BUPATI, self::DISPOSISI_WAKIL_BUPATI, self::DISPOSISI_DIWAKILKAN]);
    }

    /**
     * Scope untuk filter berdasarkan pencarian
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('nama_kegiatan', 'ilike', "%{$search}%")
                    ->orWhere('tempat', 'ilike', "%{$search}%")
                    ->orWhereHas('suratMasuk', function ($sq) use ($search) {
                        $sq->where('nomor_surat', 'ilike', "%{$search}%")
                            ->orWhere('asal_surat', 'ilike', "%{$search}%")
                            ->orWhere('perihal', 'ilike', "%{$search}%");
                    });
            });
        }
        return $query;
    }

    /**
     * Scope untuk filter berdasarkan tanggal
     */
    public function scopeFilterByTanggal(Builder $query, ?string $startDate, ?string $endDate): Builder
    {
        if ($startDate) {
            $query->where('tanggal_agenda', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('tanggal_agenda', '<=', $endDate);
        }
        return $query;
    }

    // ==================== ACCESSORS ====================

    /**
     * Get formatted waktu lengkap
     */
    public function getWaktuLengkapAttribute(): string
    {
        if ($this->sampai_selesai) {
            return $this->waktu_mulai . ' - Sampai Selesai';
        }

        return $this->waktu_mulai . ($this->waktu_selesai ? ' - ' . $this->waktu_selesai : '');
    }

    /**
     * Get formatted tanggal Indonesia
     *
     * @return string
     */
    public function getTanggalFormatIndonesiaAttribute(): string
    {
        /** @var \Illuminate\Support\Carbon|null $tanggal */
        $tanggal = $this->tanggal_agenda;
        return $tanggal?->translatedFormat('l, d F Y') ?? '-';
    }

    /**
     * Get formatted tanggal singkat
     *
     * @return string
     */
    public function getTanggalFormattedAttribute(): string
    {
        /** @var \Illuminate\Support\Carbon|null $tanggal */
        $tanggal = $this->tanggal_agenda;
        return $tanggal?->format('d/m/Y') ?? '-';
    }

    /**
     * Get label status
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_OPTIONS[$this->status] ?? $this->status;
    }

    /**
     * Get status formal pemerintahan (turunan dari status existing).
     */
    public function getStatusFormalAttribute(): string
    {
        if ($this->trashed()) {
            return self::STATUS_FORMAL_DIBATALKAN;
        }

        if ($this->status === self::STATUS_DEFINITIF) {
            /** @var \Illuminate\Support\Carbon|null $tanggal */
            $tanggal = $this->tanggal_agenda;
            if ($tanggal && $tanggal->isBefore(today())) {
                return self::STATUS_FORMAL_SELESAI;
            }

            return self::STATUS_FORMAL_TERJADWAL;
        }

        if ($this->status_disposisi === self::DISPOSISI_MENUNGGU) {
            /** @var \Illuminate\Support\Carbon|null $tanggal */
            $tanggal = $this->tanggal_agenda;
            if ($tanggal && $tanggal->isBefore(today())) {
                return self::STATUS_FORMAL_DITUNDA;
            }

            return self::STATUS_FORMAL_DALAM_PROSES;
        }

        return self::STATUS_FORMAL_DIDISPOSISIKAN;
    }

    /**
     * Get formal status label.
     */
    public function getStatusFormalLabelAttribute(): string
    {
        return self::STATUS_FORMAL_OPTIONS[$this->status_formal] ?? $this->status_formal;
    }

    /**
     * Get label status disposisi
     */
    public function getStatusDisposisiLabelAttribute(): string
    {
        return self::DISPOSISI_OPTIONS[$this->status_disposisi] ?? $this->status_disposisi;
    }

    /**
     * Get label lokasi type
     */
    public function getLokasiTypeLabelAttribute(): string
    {
        return self::LOKASI_TYPE_OPTIONS[$this->lokasi_type] ?? $this->lokasi_type ?? '-';
    }

    /**
     * Get hari dari tanggal agenda (dalam bahasa Indonesia)
     *
     * @return string
     */
    public function getHariAttribute(): string
    {
        /** @var \Illuminate\Support\Carbon|null $tanggal */
        $tanggal = $this->tanggal_agenda;
        return $tanggal?->translatedFormat('l') ?? '-';
    }
}
