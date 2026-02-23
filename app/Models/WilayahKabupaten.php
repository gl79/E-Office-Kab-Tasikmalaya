<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\Model;

class WilayahKabupaten extends Model
{
    use Compoships;
    protected $table = 'wilayah_kabupaten';
    public $incrementing = false;
    protected $fillable = ['provinsi_kode', 'kode', 'nama'];

    /**
     * Get the primary key for the model.
     *
     * @return array
     */
    public function getKeyName()
    {
        return ['provinsi_kode', 'kode'];
    }

    /**
     * Set the keys for a save update query.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
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

    /**
     * Get the primary key value for a save query.
     *
     * @param mixed $keyName
     * @return mixed
     */
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

    public function provinsi()
    {
        return $this->belongsTo(WilayahProvinsi::class, 'provinsi_kode', 'kode');
    }

    public function kecamatan()
    {
        return $this->hasMany(WilayahKecamatan::class, ['provinsi_kode', 'kabupaten_kode'], ['provinsi_kode', 'kode']);
    }
}
