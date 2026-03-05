<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel timeline_surat menyimpan riwayat lengkap setiap aksi
     * yang terjadi pada surat masuk.
     */
    public function up(): void
    {
        Schema::create('timeline_surat', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Surat terkait
            $table->ulid('surat_masuk_id');

            // User yang melakukan aksi
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // Jenis aksi
            $table->string('aksi', 30)->comment('input, kirim, baca, terima, disposisi, jadwalkan, definitif');

            // Deskripsi aksi
            $table->text('keterangan');

            // Hanya created_at (timeline tidak pernah di-update)
            $table->timestamp('created_at')->useCurrent();

            // Foreign Key ke surat masuk
            $table->foreign('surat_masuk_id')
                ->references('id')
                ->on('surat_masuks')
                ->cascadeOnDelete();

            // Indexes
            $table->index('surat_masuk_id');
            $table->index('user_id');
            $table->index('aksi');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timeline_surat');
    }
};
