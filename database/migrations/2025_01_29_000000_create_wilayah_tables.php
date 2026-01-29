<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Provinsi
        Schema::create('wilayah_provinsi', function (Blueprint $table) {
            $table->char('kode', 2)->primary();
            $table->string('nama');
            $table->softDeletes();
            $table->timestamps();
        });

        // Kabupaten
        Schema::create('wilayah_kabupaten', function (Blueprint $table) {
            $table->char('provinsi_kode', 2);
            $table->char('kode', 2);
            $table->string('nama');
            $table->primary(['provinsi_kode', 'kode']);
            $table->foreign('provinsi_kode')->references('kode')->on('wilayah_provinsi')
                ->cascadeOnDelete()->cascadeOnUpdate();
            $table->softDeletes();
            $table->timestamps();
        });

        // Kecamatan
        Schema::create('wilayah_kecamatan', function (Blueprint $table) {
            $table->char('provinsi_kode', 2);
            $table->char('kabupaten_kode', 2);
            $table->char('kode', 2);
            $table->string('nama');
            $table->primary(['provinsi_kode', 'kabupaten_kode', 'kode']);
            $table->foreign(['provinsi_kode', 'kabupaten_kode'])
                ->references(['provinsi_kode', 'kode'])->on('wilayah_kabupaten')
                ->cascadeOnDelete()->cascadeOnUpdate();
            $table->softDeletes();
            $table->timestamps();
        });

        // Desa
        Schema::create('wilayah_desa', function (Blueprint $table) {
            $table->char('provinsi_kode', 2);
            $table->char('kabupaten_kode', 2);
            $table->char('kecamatan_kode', 2);
            $table->char('kode', 4);
            $table->string('nama');
            $table->primary(['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode', 'kode']);
            $table->foreign(['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode'])
                ->references(['provinsi_kode', 'kabupaten_kode', 'kode'])->on('wilayah_kecamatan')
                ->cascadeOnDelete()->cascadeOnUpdate();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wilayah_desa');
        Schema::dropIfExists('wilayah_kecamatan');
        Schema::dropIfExists('wilayah_kabupaten');
        Schema::dropIfExists('wilayah_provinsi');
    }
};
