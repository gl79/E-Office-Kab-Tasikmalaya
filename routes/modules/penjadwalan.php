<?php

use App\Http\Controllers\Penjadwalan\PenjadwalanArchiveController;
use App\Http\Controllers\Penjadwalan\PenjadwalanController;
use App\Http\Controllers\Penjadwalan\PenjadwalanDefinitifController;
use App\Http\Controllers\Penjadwalan\PenjadwalanTentatifController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('penjadwalan')->name('penjadwalan.')->group(function () {
    // Menu Jadwal (dari Surat Masuk)

    Route::get('/jadwal', [PenjadwalanController::class, 'index'])->name('index'); // penjadwalan.index
    Route::get('/jadwal/surat-masuk/{id}', [PenjadwalanController::class, 'getSuratMasuk'])->name('surat-masuk');
    Route::post('/jadwal', [PenjadwalanController::class, 'store'])->name('store');
    Route::get('/jadwal/{id}', [PenjadwalanController::class, 'show'])->name('show');
    Route::put('/jadwal/{id}', [PenjadwalanController::class, 'update'])->name('update');
    Route::delete('/jadwal/{id}', [PenjadwalanController::class, 'destroy'])->name('destroy');

    // Menu Tentatif
    Route::get('/tentatif', [PenjadwalanTentatifController::class, 'index'])->name('tentatif.index');
    Route::put('/tentatif/{id}/kehadiran', [PenjadwalanTentatifController::class, 'updateKehadiran'])->name('tentatif.update-kehadiran');
    Route::post('/tentatif/{id}/definitif', [PenjadwalanTentatifController::class, 'jadikanDefinitif'])->name('tentatif.definitif');
    Route::get('/tentatif/{id}/export-wa', [PenjadwalanTentatifController::class, 'exportWhatsApp'])->name('tentatif.export-wa');
    Route::delete('/tentatif/{id}', [PenjadwalanTentatifController::class, 'destroy'])->name('tentatif.destroy');

    // Menu Definitif (Calendar View)
    Route::get('/definitif', [PenjadwalanDefinitifController::class, 'index'])->name('definitif.index');
    Route::get('/definitif/calendar-data', [PenjadwalanDefinitifController::class, 'calendarData'])->name('definitif.calendar-data');
    Route::get('/definitif/{id}', [PenjadwalanDefinitifController::class, 'show'])->name('definitif.show');
    Route::delete('/definitif/{id}', [PenjadwalanDefinitifController::class, 'destroy'])->name('definitif.destroy');

    // Menu Archive (Soft Delete)
    Route::get('/archive', [PenjadwalanArchiveController::class, 'index'])->name('archive.index');
    Route::post('/archive/{id}/restore', [PenjadwalanArchiveController::class, 'restore'])->name('archive.restore');
    Route::delete('/archive/{id}/force-delete', [PenjadwalanArchiveController::class, 'forceDelete'])->name('archive.force-delete');
    Route::post('/archive/restore-all', [PenjadwalanArchiveController::class, 'restoreAll'])->name('archive.restore-all');
    Route::delete('/archive/force-delete-all', [PenjadwalanArchiveController::class, 'forceDeleteAll'])->name('archive.force-delete-all');
});
