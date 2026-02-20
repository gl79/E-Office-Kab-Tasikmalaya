<?php

use App\Http\Controllers\Cuti\CutiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('cuti')->name('cuti.')->group(function () {
    Route::get('/', [CutiController::class, 'index'])->name('index');
});
