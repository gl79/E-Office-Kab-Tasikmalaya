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
        Schema::create('surat_masuks', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Identitas Agenda
            $table->string('nomor_agenda', 50)->unique();
            $table->date('tanggal_diterima');

            // Identitas Surat
            $table->date('tanggal_surat');
            $table->string('asal_surat', 255);
            $table->string('nomor_surat', 100)->unique();
            $table->string('sifat', 20); // biasa, terbatas, rahasia, sangat_rahasia
            $table->integer('lampiran')->nullable();
            $table->text('perihal');
            $table->text('isi_ringkas');

            // Foreign Keys ke Data Master
            $table->ulid('indeks_berkas_id')->nullable();
            $table->ulid('kode_klasifikasi_id')->nullable();
            $table->foreignId('staff_pengolah_id')->nullable()->constrained('users')->nullOnDelete();

            // Additional Fields
            $table->date('tanggal_diteruskan')->nullable();
            $table->text('catatan_tambahan')->nullable();
            $table->string('file_path', 255)->nullable();

            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('nomor_agenda');
            $table->index('nomor_surat');
            $table->index('tanggal_diterima');
            $table->index('tanggal_surat');

            // Foreign Key Constraints for ULID fields
            $table->foreign('indeks_berkas_id')->references('id')->on('indeks_surat')->nullOnDelete();
            $table->foreign('kode_klasifikasi_id')->references('id')->on('indeks_surat')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_masuks');
    }
};
