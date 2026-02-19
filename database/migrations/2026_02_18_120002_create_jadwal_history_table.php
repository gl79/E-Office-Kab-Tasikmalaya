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
        Schema::create('jadwal_history', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('jadwal_id')
                ->constrained('penjadwalan')
                ->cascadeOnDelete();
            $table->jsonb('old_data');
            $table->jsonb('new_data');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index('jadwal_id');
            $table->index('changed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_history');
    }
};

