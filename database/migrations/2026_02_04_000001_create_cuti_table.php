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
        Schema::create('cuti', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Pegawai Snapshot
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nama_pegawai');
            $table->string('nip_pegawai')->nullable();
            $table->string('jabatan_pegawai')->nullable();

            // Atasan Snapshot
            $table->foreignId('atasan_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nama_atasan')->nullable();
            $table->string('nip_atasan')->nullable();
            $table->string('jabatan_atasan')->nullable();

            // Detail Cuti
            $table->string('jenis_cuti');
            $table->text('alasan_cuti');
            $table->integer('lama_cuti');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->text('alamat_cuti');

            // Status
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');

            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('atasan_id');
            $table->index('status');
            $table->index('tanggal_mulai');
            $table->index('tanggal_selesai');
            $table->index(['deleted_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuti');
    }
};
