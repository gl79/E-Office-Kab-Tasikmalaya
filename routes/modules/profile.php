<?php

use App\Http\Controllers\PasswordController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Password Routes
    Route::put('/password', [PasswordController::class, 'update'])->name('password.update');
    Route::get('/password/force', [PasswordController::class, 'showForce'])->name('password.force');
    Route::put('/password/force', [PasswordController::class, 'forceUpdate'])->name('password.force_update');
});
