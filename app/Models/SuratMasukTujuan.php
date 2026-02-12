<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratMasukTujuan extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'surat_masuk_tujuans';

    protected $fillable = [
        'surat_masuk_id',
        'tujuan_id',
        'tujuan',
        'nomor_agenda',
    ];

    // ==================== STATIC METHODS ====================

    /**
     * Generate nomor agenda per-recipient dengan format SM/{number}/{year}.
     * Setiap penerima punya urutan nomor agenda sendiri.
     */
    public static function generateNomorAgendaForRecipient(string $userId): string
    {
        $year = date('Y');

        $lastNumber = self::where('tujuan_id', $userId)
            ->where('nomor_agenda', 'like', "SM/%/{$year}")
            ->get(['nomor_agenda'])
            ->map(fn($t) => (int) explode('/', $t->nomor_agenda)[1])
            ->max() ?? 0;

        return 'SM/' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT) . '/' . $year;
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
