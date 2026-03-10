<?php

use App\Http\Controllers\Penjadwalan\BupatiJadwalController;
use App\Http\Controllers\Penjadwalan\PenjadwalanDefinitifController;
use App\Http\Controllers\Penjadwalan\PenjadwalanHistoryController;
use App\Http\Controllers\Penjadwalan\PenjadwalanTentatifController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('penjadwalan')->name('penjadwalan.')->group(function () {
    // Redirect legacy jadwal page to tentatif
    Route::redirect('/jadwal', '/penjadwalan/tentatif')->name('index');

    // Menu Tentatif
    Route::get('/tentatif', [PenjadwalanTentatifController::class, 'index'])->name('tentatif.index');
    Route::put('/tentatif/{id}/tindak-lanjut', [PenjadwalanTentatifController::class, 'tindakLanjut'])->name('tentatif.tindak-lanjut');
    Route::delete('/tentatif/{id}', [PenjadwalanTentatifController::class, 'destroy'])->name('tentatif.destroy');

    // Menu Definitif (Calendar View)
    Route::get('/definitif', [PenjadwalanDefinitifController::class, 'index'])->name('definitif.index');
    Route::get('/definitif/calendar-data', [PenjadwalanDefinitifController::class, 'calendarData'])->name('definitif.calendar-data');
    Route::get('/definitif/{id}', [PenjadwalanDefinitifController::class, 'show'])->name('definitif.show');
    Route::delete('/definitif/{id}', [PenjadwalanDefinitifController::class, 'destroy'])->name('definitif.destroy');

    // Menu History Penjadwalan
    Route::get('/history', [PenjadwalanHistoryController::class, 'index'])->name('history.index');
});

Route::middleware('auth')->prefix('bupati')->name('bupati.')->group(function () {
    Route::get('/jadwal/custom', [BupatiJadwalController::class, 'customForm'])->name('jadwal.custom');
    Route::post('/jadwal/custom', [BupatiJadwalController::class, 'storeCustom'])->name('jadwal.custom.store');
    Route::get('/jadwal/{surat}', [BupatiJadwalController::class, 'form'])->name('jadwal.form');
    Route::post('/jadwal/{surat}', [BupatiJadwalController::class, 'store'])->name('jadwal.store');
    Route::put('/jadwal/{surat}', [BupatiJadwalController::class, 'update'])->name('jadwal.update');
});
