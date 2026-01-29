<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WilayahProvinsi extends Model
{
    use Compoships, SoftDeletes;
    protected $table = 'wilayah_provinsi';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['kode', 'nama'];

    public function kabupaten()
    {
        return $this->hasMany(WilayahKabupaten::class, 'provinsi_kode', 'kode');
    }
}
