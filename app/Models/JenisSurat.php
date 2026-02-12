<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JenisSurat extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $table = 'jenis_surat';

    protected $fillable = [
        'nama',
    ];
}
