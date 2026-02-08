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
     * Relasi ke user (tujuan internal)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tujuan_id');
    }
}
