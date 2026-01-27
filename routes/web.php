<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('dashboard');
})->middleware('auth');

/**
 * Protected Routes
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
    // DATA MASTER
    // ================================================================
    Route::prefix('master')->name('master.')->group(function () {
        Route::get('/kepegawaian', function () {
            return Inertia::render('Master/Kepegawaian/Index');
        })->name('kepegawaian.index');

        Route::get('/pengguna', function () {
            return Inertia::render('Master/Pengguna/Index');
        })->name('pengguna.index');

        Route::get('/unit-kerja', function () {
            return Inertia::render('Master/UnitKerja/Index');
        })->name('unit-kerja.index');

        Route::get('/indeks-surat', function () {
            return Inertia::render('Master/IndeksSurat/Index');
        })->name('indeks-surat.index');
    });

    // ================================================================
    // PERSURATAN
    // ================================================================
    Route::prefix('persuratan')->name('persuratan.')->group(function () {
        Route::get('/surat-masuk', function () {
            return Inertia::render('Persuratan/SuratMasuk/Index');
        })->name('surat-masuk.index');

        Route::get('/surat-keluar', function () {
            return Inertia::render('Persuratan/SuratKeluar/Index');
        })->name('surat-keluar.index');
    });

    // ================================================================
    // CUTI
    // ================================================================
    Route::get('/cuti', function () {
        return Inertia::render('Cuti/Index');
    })->name('cuti.index');

    // ================================================================
    // PENJADWALAN
    // ================================================================
    Route::prefix('penjadwalan')->name('penjadwalan.')->group(function () {
        Route::get('/jadwal', function () {
            return Inertia::render('Penjadwalan/Jadwal/Index');
        })->name('jadwal.index');

        Route::get('/tentatif', function () {
            return Inertia::render('Penjadwalan/Tentatif/Index');
        })->name('tentatif.index');

        Route::get('/definitif', function () {
            return Inertia::render('Penjadwalan/Definitif/Index');
        })->name('definitif.index');
    });
});

require __DIR__ . '/auth.php';
