<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property int $user_id
 * @property int|null $atasan_id
 * @property string $nama_pegawai
 * @property string|null $nip_pegawai
 * @property string|null $jabatan_pegawai
 * @property string|null $nama_atasan
 * @property string|null $nip_atasan
 * @property string|null $jabatan_atasan
 * @property string $jenis_cuti
 * @property string $alasan_cuti
 * @property int $lama_cuti
 * @property Carbon $tanggal_mulai
 * @property Carbon $tanggal_selesai
 * @property string $alamat_cuti
 * @property string $status
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property int|null $deleted_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 *
 * @property-read string $status_label
 * @property-read string $tanggal_mulai_formatted
 * @property-read string $tanggal_selesai_formatted
 * @property-read string $tanggal_range_formatted
 */
class Cuti extends Model
{
    use HasFactory, HasUlids, SoftDeletes, HasAuditTrail;

    protected $table = 'cuti';

    protected $fillable = [
        'user_id',
        'nama_pegawai',
        'nip_pegawai',
        'jabatan_pegawai',
        'atasan_id',
        'nama_atasan',
        'nip_atasan',
        'jabatan_atasan',
        'jenis_cuti',
        'alasan_cuti',
        'lama_cuti',
        'tanggal_mulai',
        'tanggal_selesai',
        'alamat_cuti',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'lama_cuti' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_OPTIONS = [
        self::STATUS_PENDING => 'Pending',
        self::STATUS_APPROVED => 'Approved',
        self::STATUS_REJECTED => 'Rejected',
        self::STATUS_CANCELLED => 'Cancelled',
    ];

    public const JENIS_CUTI_OPTIONS = [
        'Cuti Tahunan',
        'Cuti Besar',
        'Cuti Sakit',
        'Cuti Melahirkan',
        'Cuti Karena Alasan Penting',
        'Cuti di Luar Tanggungan Negara',
    ];

    // ==================== RELATIONSHIPS ====================

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function atasan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atasan_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deleter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    // ==================== SCOPES ====================

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_pegawai', 'ilike', "%{$search}%")
                    ->orWhere('nip_pegawai', 'ilike', "%{$search}%")
                    ->orWhere('jabatan_pegawai', 'ilike', "%{$search}%")
                    ->orWhere('nama_atasan', 'ilike', "%{$search}%")
                    ->orWhere('nip_atasan', 'ilike', "%{$search}%")
                    ->orWhere('jenis_cuti', 'ilike', "%{$search}%")
                    ->orWhere('alasan_cuti', 'ilike', "%{$search}%");
            });
        }

        return $query;
    }

    // ==================== ACCESSORS ====================

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_OPTIONS[$this->status] ?? $this->status;
    }

    public function getTanggalMulaiFormattedAttribute(): string
    {
        return $this->tanggal_mulai?->format('d/m/Y') ?? '-';
    }

    public function getTanggalSelesaiFormattedAttribute(): string
    {
        return $this->tanggal_selesai?->format('d/m/Y') ?? '-';
    }

    public function getTanggalRangeFormattedAttribute(): string
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai) {
            return '-';
        }

        return $this->tanggal_mulai->format('d/m/Y') . ' s.d ' . $this->tanggal_selesai->format('d/m/Y');
    }
}
