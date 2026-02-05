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
        Schema::create('surat_keluars', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Identitas Surat
            $table->date('tanggal_surat');
            $table->string('no_urut', 50);
            $table->string('nomor_surat', 100)->unique();
            $table->string('kepada', 255);
            $table->text('perihal');
            $table->text('isi_ringkas');

            // Sifat Surat
            $table->string('sifat_1', 20); // biasa, terbatas, rahasia, sangat_rahasia
            $table->string('sifat_2', 20); // biasa, penting, segera, amat_segera

            // Foreign Keys ke Data Master
            $table->ulid('indeks_id')->nullable();
            $table->ulid('kode_klasifikasi_id')->nullable();
            $table->ulid('unit_kerja_id')->nullable();

            // Additional Fields
            $table->string('kode_pengolah', 50)->nullable();
            $table->integer('lampiran')->nullable();
            $table->text('catatan')->nullable();
            $table->string('file_path', 255)->nullable();

            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('nomor_surat');
            $table->index('tanggal_surat');

            // Foreign Key Constraints for ULID fields
            $table->foreign('indeks_id')->references('id')->on('indeks_surat')->nullOnDelete();
            $table->foreign('kode_klasifikasi_id')->references('id')->on('indeks_surat')->nullOnDelete();
            $table->foreign('unit_kerja_id')->references('id')->on('unit_kerja')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_keluars');
    }
};
