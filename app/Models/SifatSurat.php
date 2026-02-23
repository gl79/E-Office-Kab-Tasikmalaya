<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SifatSurat extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'sifat_surat';

    protected $fillable = [
        'nama',
    ];

    public const DEFAULT_NAMA = [
        'Biasa',
        'Terbatas',
        'Rahasia',
        'Sangat Rahasia',
    ];

    public static function normalizeValue(string $nama): string
    {
        return (string) Str::of($nama)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', '_')
            ->trim('_');
    }

    /**
     * Return options with key format used in persuratan tables.
     *
     * @return array<string, string>
     */
    public static function getOptions(): array
    {
        $items = self::query()
            ->orderBy('nama')
            ->pluck('nama');

        if ($items->isEmpty()) {
            $items = collect(self::DEFAULT_NAMA);
        }

        return $items
            ->mapWithKeys(fn(string $nama) => [self::normalizeValue($nama) => $nama])
            ->all();
    }

    /**
     * @return string[]
     */
    public static function allowedValues(): array
    {
        return array_keys(self::getOptions());
    }
}
