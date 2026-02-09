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
        // FK columns (created_by, indeks_berkas_id, etc.) already have
        // auto-created indexes from their foreign key constraints.
        // Only deleted_at needs an explicit index for soft-delete queries.
        Schema::table('surat_masuks', function (Blueprint $table) {
            $table->index('deleted_at');
        });

        Schema::table('surat_keluars', function (Blueprint $table) {
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat_masuks', function (Blueprint $table) {
            $table->dropIndex(['deleted_at']);
        });

        Schema::table('surat_keluars', function (Blueprint $table) {
            $table->dropIndex(['deleted_at']);
        });
    }
};
