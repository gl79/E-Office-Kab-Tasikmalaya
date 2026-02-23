<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\Model;

class WilayahKecamatan extends Model
{
    use Compoships;
    protected $table = 'wilayah_kecamatan';
    public $incrementing = false;
    protected $fillable = ['provinsi_kode', 'kabupaten_kode', 'kode', 'nama'];

    public function getKeyName()
    {
        return ['provinsi_kode', 'kabupaten_kode', 'kode'];
    }

    protected function setKeysForSaveQuery($query)
    {
        $keys = $this->getKeyName();
        if (!is_array($keys)) {
            return parent::setKeysForSaveQuery($query);
        }

        foreach ($keys as $keyName) {
            $query->where($keyName, '=', $this->getKeyForSaveQuery($keyName));
        }

        return $query;
    }

    protected function getKeyForSaveQuery($keyName = null)
    {
        if (is_null($keyName)) {
            $keyName = $this->getKeyName();
        }

        if (isset($this->original[$keyName])) {
            return $this->original[$keyName];
        }

        return $this->getAttribute($keyName);
    }

    public function kabupaten()
    {
        return $this->belongsTo(WilayahKabupaten::class, ['provinsi_kode', 'kabupaten_kode'], ['provinsi_kode', 'kode']);
    }

    public function desa()
    {
        return $this->hasMany(WilayahDesa::class, ['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode'], ['provinsi_kode', 'kabupaten_kode', 'kode']);
    }
}
