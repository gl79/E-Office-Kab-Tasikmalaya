<?php

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

        // Unified Archive
        Route::get('/archive', [\App\Http\Controllers\Master\MasterArchiveController::class, 'index'])->name('archive');

        Route::resource('unit-kerja', \App\Http\Controllers\Master\UnitKerjaController::class)->except(['create', 'show', 'edit']);
        Route::post('unit-kerja/{id}/restore', [\App\Http\Controllers\Master\UnitKerjaController::class, 'restore'])->name('unit-kerja.restore');
        Route::delete('unit-kerja/{id}/force-delete', [\App\Http\Controllers\Master\UnitKerjaController::class, 'forceDelete'])->name('unit-kerja.force-delete');

        Route::resource('indeks-surat', \App\Http\Controllers\Master\IndeksSuratController::class)->except(['create', 'show', 'edit']);
        Route::post('indeks-surat/{id}/restore', [\App\Http\Controllers\Master\IndeksSuratController::class, 'restore'])->name('indeks-surat.restore');
        Route::delete('indeks-surat/{id}/force-delete', [\App\Http\Controllers\Master\IndeksSuratController::class, 'forceDelete'])->name('indeks-surat.force-delete');

        // Wilayah Routes
        Route::prefix('wilayah')->name('wilayah.')->group(function () {
            Route::get('provinsi/all', [\App\Http\Controllers\Master\Wilayah\ProvinsiController::class, 'getAll'])->name('provinsi.all');
            Route::resource('provinsi', \App\Http\Controllers\Master\Wilayah\ProvinsiController::class)->except(['create', 'show', 'edit']);

            Route::get('kabupaten', [\App\Http\Controllers\Master\Wilayah\KabupatenController::class, 'index'])->name('kabupaten.index');
            Route::post('kabupaten', [\App\Http\Controllers\Master\Wilayah\KabupatenController::class, 'store'])->name('kabupaten.store');
            Route::put('kabupaten/{provinsi_kode}/{kode}', [\App\Http\Controllers\Master\Wilayah\KabupatenController::class, 'update'])->name('kabupaten.update');
            Route::delete('kabupaten/{provinsi_kode}/{kode}', [\App\Http\Controllers\Master\Wilayah\KabupatenController::class, 'destroy'])->name('kabupaten.destroy');
            Route::get('kabupaten/by-provinsi/{provinsiKode}', [\App\Http\Controllers\Master\Wilayah\KabupatenController::class, 'getKabupatenByProvinsi'])->name('kabupaten.by-provinsi');

            Route::get('kecamatan', [\App\Http\Controllers\Master\Wilayah\KecamatanController::class, 'index'])->name('kecamatan.index');
            Route::post('kecamatan', [\App\Http\Controllers\Master\Wilayah\KecamatanController::class, 'store'])->name('kecamatan.store');
            Route::put('kecamatan/{provinsi_kode}/{kabupaten_kode}/{kode}', [\App\Http\Controllers\Master\Wilayah\KecamatanController::class, 'update'])->name('kecamatan.update');
            Route::delete('kecamatan/{provinsi_kode}/{kabupaten_kode}/{kode}', [\App\Http\Controllers\Master\Wilayah\KecamatanController::class, 'destroy'])->name('kecamatan.destroy');
            Route::get('kecamatan/by-kabupaten/{provinsiKode}/{kabupatenKode}', [\App\Http\Controllers\Master\Wilayah\KecamatanController::class, 'getKecamatanByKabupaten'])->name('kecamatan.by-kabupaten');

            Route::get('desa', [\App\Http\Controllers\Master\Wilayah\DesaController::class, 'index'])->name('desa.index');
            Route::post('desa', [\App\Http\Controllers\Master\Wilayah\DesaController::class, 'store'])->name('desa.store');
            Route::put('desa/{provinsi_kode}/{kabupaten_kode}/{kecamatan_kode}/{kode}', [\App\Http\Controllers\Master\Wilayah\DesaController::class, 'update'])->name('desa.update');
            Route::delete('desa/{provinsi_kode}/{kabupaten_kode}/{kecamatan_kode}/{kode}', [\App\Http\Controllers\Master\Wilayah\DesaController::class, 'destroy'])->name('desa.destroy');
        });
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

        Route::get('/archive', function () {
            return Inertia::render('ComingSoon');
        })->name('archive');
    });

    // Placeholder Routes for other Archives
    Route::get('/persuratan/archive', function () {
        return Inertia::render('ComingSoon');
    })->name('persuratan.archive');

    Route::get('/cuti/archive', function () {
        return Inertia::render('ComingSoon');
    })->name('cuti.archive');
});

require __DIR__ . '/auth.php';
