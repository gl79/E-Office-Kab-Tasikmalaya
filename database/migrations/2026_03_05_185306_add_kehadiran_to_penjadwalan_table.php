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
        Schema::table('penjadwalan', function (Blueprint $table) {
            $table->enum('status_kehadiran', ['Dihadiri', 'Diwakilkan', 'Tidak Dihadiri'])
                ->nullable()
                ->after('status_disposisi');
            $table->string('nama_yang_mewakili', 255)
                ->nullable()
                ->after('status_kehadiran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penjadwalan', function (Blueprint $table) {
            $table->dropColumn(['status_kehadiran', 'nama_yang_mewakili']);
        });
    }
};
