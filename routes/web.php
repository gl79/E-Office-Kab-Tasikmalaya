<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Route aplikasi E-Office.
| Semua route kecuali auth (login/logout) dilindungi middleware 'auth'.
|
*/

/**
 * Root redirect
 * - Jika belum login: redirect ke login (handled by auth middleware)
 * - Jika sudah login: redirect ke dashboard
 */
Route::get('/', function () {
    return redirect()->route('dashboard');
})->middleware('auth');

/**
 * Protected Routes
 * Semua route di bawah ini memerlukan autentikasi
 */
Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ================================================================
    // PLACEHOLDER ROUTES - akan diisi sesuai modul yang dikembangkan
    // ================================================================

    // Master Data
    // Route::prefix('master')->name('master.')->group(function () {
    //     Route::resource('kepegawaian', KepegawaianController::class);
    //     Route::resource('pengguna', PenggunaController::class);
    //     Route::resource('unit-kerja', UnitKerjaController::class);
    //     Route::resource('indeks-surat', IndeksSuratController::class);
    // });

    // Persuratan
    // Route::prefix('persuratan')->name('persuratan.')->group(function () {
    //     Route::resource('surat-masuk', SuratMasukController::class);
    //     Route::resource('surat-keluar', SuratKeluarController::class);
    //     Route::resource('sampah', SampahController::class);
    // });

    // Cuti
    // Route::resource('cuti', CutiController::class);

    // Penjadwalan
    // Route::prefix('penjadwalan')->name('penjadwalan.')->group(function () {
    //     Route::resource('jadwal', JadwalController::class);
    //     Route::resource('tentatif', TentatifController::class);
    //     Route::resource('definitif', DefinitifController::class);
    // });
});

/**
 * Auth Routes (login, logout, register, etc)
 * Dihandle oleh auth.php
 */
require __DIR__ . '/auth.php';
