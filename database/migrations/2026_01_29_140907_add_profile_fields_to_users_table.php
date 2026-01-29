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
        Schema::table('users', function (Blueprint $table) {
            $table->string('foto')->nullable()->after('role');
            $table->string('nip', 30)->nullable()->after('foto');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('nip');
            $table->string('jabatan')->nullable()->after('jenis_kelamin');
            $table->json('module_access')->nullable()->after('jabatan');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['foto', 'nip', 'jenis_kelamin', 'jabatan', 'module_access']);
            $table->dropSoftDeletes();
        });
    }
};
