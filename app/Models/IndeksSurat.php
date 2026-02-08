<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IndeksSurat extends Model
{
    use HasFactory, HasUlids, SoftDeletes, HasAuditTrail;

    protected $table = 'indeks_surat';

    protected $fillable = [
        'kode',
        'nama',
        'jenis_surat',
        'urutan',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    public const JENIS_PENANDATANGANAN = 'Penandatanganan';
    public const JENIS_PEMBERIAN_BANTUAN = 'Pemberian Bantuan';
    public const JENIS_AUDIENSI = 'Audiensi';
    public const JENIS_SURAT_TUGAS = 'Surat Tugas';

    public const JENIS_OPTIONS = [
        self::JENIS_PENANDATANGANAN => 'Penandatanganan',
        self::JENIS_PEMBERIAN_BANTUAN => 'Pemberian Bantuan',
        self::JENIS_AUDIENSI => 'Audiensi',
        self::JENIS_SURAT_TUGAS => 'Surat Tugas',
    ];
}
