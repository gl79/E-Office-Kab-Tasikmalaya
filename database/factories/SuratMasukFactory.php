<?php

namespace Database\Factories;

use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SuratMasuk>
 */
class SuratMasukFactory extends Factory
{
    protected $model = SuratMasuk::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nomor_agenda' => 'SM/' . str_pad((string) $this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT) . '/' . date('Y'),
            'tanggal_diterima' => now()->toDateString(),
            'tanggal_surat' => now()->subDays(2)->toDateString(),
            'asal_surat' => $this->faker->company(),
            'nomor_surat' => 'NS-' . Str::upper(Str::random(8)),
            'sifat' => 'biasa',
            'lampiran' => $this->faker->numberBetween(0, 5),
            'perihal' => $this->faker->sentence(),
            'isi_ringkas' => $this->faker->paragraph(),
            'status' => SuratMasuk::STATUS_BARU,
            'created_by' => User::factory(),
            'updated_by' => function (array $attributes) {
                return $attributes['created_by'];
            },
        ];
    }
}
