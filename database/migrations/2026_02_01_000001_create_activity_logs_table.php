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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 50); // login, logout, create, update, delete, view, etc.
            $table->string('model_type')->nullable(); // e.g., App\Models\User
            $table->string('model_id')->nullable(); // ID of the affected model
            $table->text('description');
            $table->string('ip_address', 45)->nullable(); // IPv6 compatible
            $table->text('user_agent')->nullable();
            $table->jsonb('properties')->nullable(); // old/new values, extra data
            $table->timestamp('created_at')->useCurrent();

            // Indexes for performance
            $table->index('user_id');
            $table->index('action');
            $table->index('model_type');
            $table->index('created_at');
            $table->index('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
