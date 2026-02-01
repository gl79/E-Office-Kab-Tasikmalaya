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
        Schema::create('disposisi_surat', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('surat_masuk_id');

            // Penanda Tangan
            $table->string('penanda_tangan', 100);
            $table->string('jabatan_penanda_tangan', 100);

            // Detail Disposisi
            $table->text('tujuan_disposisi')->nullable(); // JSON atau text
            $table->text('instruksi')->nullable();
            $table->date('tanggal_disposisi');

            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // Foreign Key dengan CASCADE delete
            $table->foreign('surat_masuk_id')
                  ->references('id')
                  ->on('surat_masuks')
                  ->cascadeOnDelete();

            // Index
            $table->index('surat_masuk_id');
            $table->index('tanggal_disposisi');
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
