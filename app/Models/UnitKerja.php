<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitKerja extends Model
{
    use HasFactory, HasUlids, HasAuditTrail;

    protected $table = 'unit_kerja';

    protected $fillable = [
        'nama',
        'singkatan',
        'created_by',
        'updated_by',
        'deleted_by',
    ];
}
