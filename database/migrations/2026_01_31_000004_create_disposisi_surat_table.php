<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel disposisi_surat menyimpan rantai disposisi surat masuk.
     * Setiap baris merepresentasikan 1 langkah disposisi dari satu pejabat ke pejabat lain.
     * Rantai: TU → Bupati → Wakil → Asda → dst.
     */
    public function up(): void
    {
        Schema::create('disposisi_surat', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Surat yang didisposisi
            $table->ulid('surat_masuk_id');

            // Rantai disposisi: dari siapa ke siapa
            $table->foreignId('dari_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ke_user_id')->constrained('users')->cascadeOnDelete();

            // Detail disposisi
            $table->text('catatan')->nullable()->comment('Catatan/instruksi disposisi');

            // Status baca
            $table->timestamp('dibaca_at')->nullable()->comment('Kapan penerima membuka disposisi');

            $table->timestamps();

            // Foreign Key ke surat masuk dengan CASCADE delete
            $table->foreign('surat_masuk_id')
                ->references('id')
                ->on('surat_masuks')
                ->cascadeOnDelete();

            // Indexes
            $table->index('surat_masuk_id');
            $table->index('dari_user_id');
            $table->index('ke_user_id');
            $table->index('dibaca_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disposisi_surat');
    }
};
