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
        Schema::table('indeks_surat', function (Blueprint $table) {
            $table->char('parent_id', 26)->nullable()->after('id');
            $table->unsignedTinyInteger('level')->default(1)->after('nama');
            $table->dropColumn('jenis_surat');

            $table->foreign('parent_id')
                ->references('id')
                ->on('indeks_surat')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('indeks_surat', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropIndex(['parent_id']);
            $table->dropColumn(['parent_id', 'level']);
            $table->string('jenis_surat')->nullable()->after('nama');
        });
    }
};
