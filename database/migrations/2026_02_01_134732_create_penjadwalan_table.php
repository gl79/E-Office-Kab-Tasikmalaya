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
        Schema::create('penjadwalan', function (Blueprint $table) {
            // Primary Key - ULID
            $table->ulid('id')->primary();

            // Foreign Key ke surat_masuk
            $table->foreignUlid('surat_masuk_id')
                ->constrained('surat_masuks')
                ->cascadeOnDelete();

            // Informasi Jadwal
            $table->date('tanggal_agenda');
            $table->time('waktu_mulai');
            $table->time('waktu_selesai')->nullable();
            $table->boolean('sampai_selesai')->default(false)->comment('True jika tidak ada jam selesai pasti');
            $table->string('nama_kegiatan');

            // Lokasi
            $table->enum('lokasi_type', ['dalam_daerah', 'luar_daerah'])->nullable();
            $table->string('kode_wilayah', 20)->nullable()->comment('Format: xx.xx.xx.xxxx untuk dalam daerah');
            $table->string('tempat', 500)->comment('Detail lokasi atau nama tempat');

            // Status & Disposisi
            $table->enum('status', ['definitif', 'tentatif'])->default('tentatif');
            $table->enum('status_disposisi', ['menunggu', 'bupati', 'wakil_bupati', 'diwakilkan'])->default('menunggu');
            $table->string('dihadiri_oleh')->nullable();
            $table->foreignId('dihadiri_oleh_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Catatan
            $table->text('keterangan')->nullable();

            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes untuk Performance
            $table->index('tanggal_agenda');
            $table->index('status');
            $table->index('status_disposisi');
            $table->index('dihadiri_oleh_user_id', 'penjadwalan_dihadiri_oleh_user_idx');
            $table->index(['deleted_at', 'status']);
            $table->unique('surat_masuk_id', 'penjadwalan_surat_masuk_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penjadwalan');
    }
};
