<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class SuratMasukTujuan extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'surat_masuk_tujuans';

    protected $fillable = [
        'surat_masuk_id',
        'tujuan_id',
        'tujuan',
        'nomor_agenda',
        'is_primary',
        'is_tembusan',
        'status_penerimaan',
        'diterima_at',
    ];

    protected $casts = [
        'diterima_at' => 'datetime',
        'is_primary' => 'boolean',
        'is_tembusan' => 'boolean',
    ];

    public const STATUS_MENUNGGU_PENERIMAAN = 'Menunggu Penerimaan';
    public const STATUS_DITERIMA = 'Diterima';

    /**
     * Resolve status penerimaan awal berdasarkan jabatan user tujuan.
     * User dengan jabatan can_dispose harus menunggu penerimaan (terima surat dulu).
     * User lainnya langsung diterima.
     *
     * @return array{status_penerimaan: string, diterima_at: Carbon|null}
     */
    public static function initialPenerimaanState(?User $tujuanUser): array
    {
        $shouldWaitAcceptance = $tujuanUser && $tujuanUser->canDispose();

        return [
            'status_penerimaan' => $shouldWaitAcceptance
                ? self::STATUS_MENUNGGU_PENERIMAAN
                : self::STATUS_DITERIMA,
            'diterima_at' => $shouldWaitAcceptance ? null : now(),
        ];
    }

    public function isDiterima(): bool
    {
        return $this->status_penerimaan === self::STATUS_DITERIMA;
    }

    public function isMenungguPenerimaan(): bool
    {
        return $this->status_penerimaan === self::STATUS_MENUNGGU_PENERIMAAN;
    }

    /**
     * Cek apakah penerima ini adalah penerima utama (bukan tembusan).
     */
    public function isPrimary(): bool
    {
        return (bool) $this->is_primary;
    }

    /**
     * Cek apakah penerima ini adalah tembusan.
     */
    public function isTembusan(): bool
    {
        return (bool) $this->is_tembusan;
    }

    // ==================== STATIC METHODS ====================

    /**
     * Generate nomor agenda per-recipient dengan format SM/{number}/{year}.
     * Setiap penerima punya urutan nomor agenda sendiri.
     */
    public static function generateNomorAgendaForRecipient(string $userId): string
    {
        $year = date('Y');

        // Hanya hitung nomor agenda yang parent surat masuk-nya masih aktif (tidak dihapus)
        $existingNumbers = self::where('tujuan_id', $userId)
            ->where('nomor_agenda', 'like', "SM/%/{$year}")
            ->whereHas('suratMasuk', fn($q) => $q->whereNull('deleted_at'))
            ->pluck('nomor_agenda')
            ->map(fn($agenda) => (int) explode('/', $agenda)[1])
            ->sort()
            ->values();

        // Cari nomor pertama yang tersedia (isi gap yang kosong)
        $nextNumber = 1;
        while ($existingNumbers->contains($nextNumber)) {
            $nextNumber++;
        }

        return 'SM/' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT) . '/' . $year;
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Relasi ke surat masuk
     */
    public function suratMasuk(): BelongsTo
    {
        return $this->belongsTo(SuratMasuk::class, 'surat_masuk_id');
    }

    /**
     * Relasi ke user (tujuan internal)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tujuan_id');
    }
}
