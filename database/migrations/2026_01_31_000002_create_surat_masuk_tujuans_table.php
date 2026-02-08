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
        Schema::create('surat_masuk_tujuans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('surat_masuk_id');
            $table->foreignId('tujuan_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('tujuan', 255); // Bupati, Wakil Bupati, Sekda, Asda 1, dst

            $table->timestamps();

            // Foreign Key dengan CASCADE delete
            $table->foreign('surat_masuk_id')
                  ->references('id')
                  ->on('surat_masuks')
                  ->cascadeOnDelete();

            // Index
            $table->index('surat_masuk_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_masuk_tujuans');
    }
};
