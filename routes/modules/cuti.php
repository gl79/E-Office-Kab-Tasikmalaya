<?php

use App\Http\Controllers\Cuti\CutiArchiveController;
use App\Http\Controllers\Cuti\CutiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('cuti')->name('cuti.')->group(function () {
    Route::get('/', [CutiController::class, 'index'])->name('index');
    Route::get('/create', [CutiController::class, 'create'])->name('create');
    Route::post('/', [CutiController::class, 'store'])->name('store');

    // Archive (Soft Delete)
    Route::get('/archive', [CutiArchiveController::class, 'index'])->name('archive.index');
    Route::post('/archive/{id}/restore', [CutiArchiveController::class, 'restore'])->name('archive.restore');
    Route::delete('/archive/{id}/force-delete', [CutiArchiveController::class, 'forceDelete'])->name('archive.force-delete');
    Route::post('/archive/restore-all', [CutiArchiveController::class, 'restoreAll'])->name('archive.restore-all');
    Route::delete('/archive/force-delete-all', [CutiArchiveController::class, 'forceDeleteAll'])->name('archive.force-delete-all');

    Route::get('/{id}', [CutiController::class, 'show'])->name('show');
    Route::get('/{id}/edit', [CutiController::class, 'edit'])->name('edit');
    Route::put('/{id}', [CutiController::class, 'update'])->name('update');
    Route::post('/{id}/cancel', [CutiController::class, 'cancel'])->name('cancel');
    Route::post('/{id}/approve', [CutiController::class, 'approve'])->name('approve');
    Route::post('/{id}/reject', [CutiController::class, 'reject'])->name('reject');
    Route::delete('/{id}', [CutiController::class, 'destroy'])->name('destroy');
});
