<?php

namespace Database\Factories;

use App\Models\DisposisiSurat;
use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DisposisiSurat>
 */
class DisposisiSuratFactory extends Factory
{
    protected $model = DisposisiSurat::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'surat_masuk_id' => SuratMasuk::factory(),
            'dari_user_id' => User::factory(),
            'ke_user_id' => User::factory(),
            'catatan' => $this->faker->sentence(),
            'dibaca_at' => null,
        ];
    }
}
