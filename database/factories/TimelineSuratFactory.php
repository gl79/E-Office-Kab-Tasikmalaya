<?php

namespace Database\Factories;

use App\Models\SuratMasuk;
use App\Models\TimelineSurat;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimelineSurat>
 */
class TimelineSuratFactory extends Factory
{
    protected $model = TimelineSurat::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'surat_masuk_id' => SuratMasuk::factory(),
            'user_id' => User::factory(),
            'aksi' => TimelineSurat::AKSI_INPUT,
            'keterangan' => $this->faker->sentence(),
            'created_at' => now(),
        ];
    }
}
