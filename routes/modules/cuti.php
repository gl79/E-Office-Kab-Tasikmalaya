<?php

use App\Http\Controllers\Cuti\CutiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/cuti', [CutiController::class, 'index'])->name('cuti.index');
    Route::get('/cuti/archive', [CutiController::class, 'archive'])->name('cuti.archive');
});
