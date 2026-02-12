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
        Schema::create('indeks_surat', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->char('parent_id', 26)->nullable();
            $table->string('kode', 50)->unique();
            $table->string('nama');
            $table->unsignedTinyInteger('level')->default(1);
            $table->integer('urutan')->nullable();

            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('parent_id');
        });

        // Self-referencing FK harus terpisah dari Schema::create (PostgreSQL constraint)
        Schema::table('indeks_surat', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('indeks_surat')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indeks_surat');
    }
};
