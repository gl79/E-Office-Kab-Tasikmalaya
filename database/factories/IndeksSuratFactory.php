<?php

namespace Database\Factories;

use App\Models\IndeksSurat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\IndeksSurat>
 */
class IndeksSuratFactory extends Factory
{
    protected $model = IndeksSurat::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kode' => $this->faker->unique()->bothify('###'),
            'nama' => $this->faker->words(3, true),
            'level' => 1,
            'parent_id' => null,
        ];
    }
}
