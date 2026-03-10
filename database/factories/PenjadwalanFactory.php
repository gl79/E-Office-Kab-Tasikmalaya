<?php

namespace Database\Factories;

use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Penjadwalan>
 */
class PenjadwalanFactory extends Factory
{
    protected $model = Penjadwalan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'surat_masuk_id' => SuratMasuk::factory(),
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '08:00:00',
            'waktu_selesai' => '10:00:00',
            'sampai_selesai' => false,
            'nama_kegiatan' => $this->faker->sentence(),
            'lokasi_type' => Penjadwalan::LOKASI_DALAM_DAERAH,
            'kode_wilayah' => '32.06.01.0001',
            'tempat' => $this->faker->address(),
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
            'sumber_jadwal' => Penjadwalan::SUMBER_DISPOSISI,
            'dihadiri_oleh' => $this->faker->name(),
            'dihadiri_oleh_user_id' => User::factory(),
            'created_by' => User::factory(),
            'updated_by' => function (array $attributes) {
                return $attributes['created_by'];
            },
        ];
    }
}
