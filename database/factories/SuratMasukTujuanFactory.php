<?php

namespace Database\Factories;

use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SuratMasukTujuan>
 */
class SuratMasukTujuanFactory extends Factory
{
    protected $model = SuratMasukTujuan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'surat_masuk_id' => SuratMasuk::factory(),
            'tujuan_id' => User::factory(),
            'tujuan' => function (array $attributes) {
                return User::find($attributes['tujuan_id'])->name;
            },
            'nomor_agenda' => 'SM/' . str_pad((string) $this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT) . '/' . date('Y'),
            'is_primary' => true,
            'is_tembusan' => false,
            'status_penerimaan' => SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
        ];
    }
}
