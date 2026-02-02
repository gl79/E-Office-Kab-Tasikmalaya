<?php

use App\Http\Controllers\Pengaturan\ActivityLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:superadmin'])->prefix('pengaturan')->name('pengaturan.')->group(function () {
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});
