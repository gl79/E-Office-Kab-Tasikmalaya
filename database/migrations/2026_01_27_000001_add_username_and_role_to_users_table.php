<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add columns as nullable first
            $table->string('username')->nullable()->after('name');
            $table->string('role')->default('tu')->after('username');
        });

        // Update existing users with username based on email (before @)
        DB::table('users')->whereNull('username')->get()->each(function ($user) {
            $baseUsername = explode('@', $user->email)[0];
            $username = $baseUsername;
            $counter = 1;

            // Ensure unique username
            while (DB::table('users')->where('username', $username)->where('id', '!=', $user->id)->exists()) {
                $username = $baseUsername . $counter;
                $counter++;
            }

            DB::table('users')->where('id', $user->id)->update(['username' => $username]);
        });

        // Now make username required and unique
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'role']);
        });
    }
};
