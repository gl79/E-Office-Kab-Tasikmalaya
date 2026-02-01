<?php

use App\Http\Controllers\Master\PenggunaController;
use App\Http\Controllers\Master\Wilayah\DesaController;
use App\Http\Controllers\Master\Wilayah\KabupatenController;
use App\Http\Controllers\Master\Wilayah\KecamatanController;
use App\Http\Controllers\Master\Wilayah\ProvinsiController;
use App\Http\Controllers\Persuratan\SuratMasukController;
use App\Http\Controllers\Persuratan\SuratKeluarController;
use App\Http\Controllers\Persuratan\ArchiveController;
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
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Profile Routes
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

    // Password Routes
    Route::put('/password', [App\Http\Controllers\PasswordController::class, 'update'])->name('password.update');
    Route::get('/password/force', [App\Http\Controllers\PasswordController::class, 'showForce'])->name('password.force');
    Route::put('/password/force', [App\Http\Controllers\PasswordController::class, 'forceUpdate'])->name('password.force_update');

    // ================================================================
    // PENGATURAN & LOGS (Superadmin only)
    // ================================================================
    Route::prefix('pengaturan')->name('pengaturan.')->group(function () {
        Route::get('/activity-logs', [App\Http\Controllers\ActivityLogController::class, 'index'])
            ->name('activity-logs.index')
            ->middleware('role:superadmin');
    });

    // ================================================================
    // DATA MASTER
    // ================================================================
    Route::prefix('master')->name('master.')->group(function () {
        Route::get('/kepegawaian', function () {
            return Inertia::render('Master/Kepegawaian/Index');
        })->name('kepegawaian.index');

        // Pengguna CRUD
        Route::get('/pengguna', [PenggunaController::class, 'index'])->name('pengguna.index');
        Route::post('/pengguna', [PenggunaController::class, 'store'])->name('pengguna.store');
        Route::post('/pengguna/{pengguna}', [PenggunaController::class, 'update'])->name('pengguna.update');
        Route::delete('/pengguna/{pengguna}', [PenggunaController::class, 'destroy'])->name('pengguna.destroy');
        Route::get('/pengguna/archive', [PenggunaController::class, 'archive'])->name('pengguna.archive');
        Route::post('/pengguna/{id}/restore', [PenggunaController::class, 'restore'])->name('pengguna.restore');
        Route::delete('/pengguna/{id}/force-delete', [PenggunaController::class, 'forceDelete'])->name('pengguna.force-delete');

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
            Route::get('provinsi/all', [ProvinsiController::class, 'getAll'])->name('provinsi.all');
            Route::resource('provinsi', ProvinsiController::class)->except(['create', 'show', 'edit']);
            Route::post('provinsi/{kode}/restore', [ProvinsiController::class, 'restore'])->name('provinsi.restore');
            Route::delete('provinsi/{kode}/force-delete', [ProvinsiController::class, 'forceDelete'])->name('provinsi.force-delete');

            Route::get('kabupaten', [KabupatenController::class, 'index'])->name('kabupaten.index');
            Route::post('kabupaten', [KabupatenController::class, 'store'])->name('kabupaten.store');
            Route::put('kabupaten/{provinsi_kode}/{kode}', [KabupatenController::class, 'update'])->name('kabupaten.update');
            Route::delete('kabupaten/{provinsi_kode}/{kode}', [KabupatenController::class, 'destroy'])->name('kabupaten.destroy');
            Route::post('kabupaten/{id}/restore', [KabupatenController::class, 'restore'])->name('kabupaten.restore');
            Route::delete('kabupaten/{id}/force-delete', [KabupatenController::class, 'forceDelete'])->name('kabupaten.force-delete');
            Route::get('kabupaten/by-provinsi/{provinsiKode}', [KabupatenController::class, 'getKabupatenByProvinsi'])->name('kabupaten.by-provinsi');

            Route::get('kecamatan', [KecamatanController::class, 'index'])->name('kecamatan.index');
            Route::post('kecamatan', [KecamatanController::class, 'store'])->name('kecamatan.store');
            Route::put('kecamatan/{provinsi_kode}/{kabupaten_kode}/{kode}', [KecamatanController::class, 'update'])->name('kecamatan.update');
            Route::delete('kecamatan/{provinsi_kode}/{kabupaten_kode}/{kode}', [KecamatanController::class, 'destroy'])->name('kecamatan.destroy');
            Route::post('kecamatan/{id}/restore', [KecamatanController::class, 'restore'])->name('kecamatan.restore');
            Route::delete('kecamatan/{id}/force-delete', [KecamatanController::class, 'forceDelete'])->name('kecamatan.force-delete');
            Route::get('kecamatan/by-kabupaten/{provinsiKode}/{kabupatenKode}', [KecamatanController::class, 'getKecamatanByKabupaten'])->name('kecamatan.by-kabupaten');

            Route::get('desa', [DesaController::class, 'index'])->name('desa.index');
            Route::post('desa', [DesaController::class, 'store'])->name('desa.store');
            Route::put('desa/{provinsi_kode}/{kabupaten_kode}/{kecamatan_kode}/{kode}', [DesaController::class, 'update'])->name('desa.update');
            Route::delete('desa/{provinsi_kode}/{kabupaten_kode}/{kecamatan_kode}/{kode}', [DesaController::class, 'destroy'])->name('desa.destroy');
            Route::post('desa/{id}/restore', [DesaController::class, 'restore'])->name('desa.restore');
            Route::delete('desa/{id}/force-delete', [DesaController::class, 'forceDelete'])->name('desa.force-delete');
        });
    });

    // ================================================================
    // PERSURATAN
    // ================================================================
    Route::prefix('persuratan')->name('persuratan.')->group(function () {
        // Surat Masuk Routes
        Route::resource('surat-masuk', SuratMasukController::class);
        Route::post('surat-masuk/{id}/restore', [SuratMasukController::class, 'restore'])->name('surat-masuk.restore');
        Route::delete('surat-masuk/{id}/force-delete', [SuratMasukController::class, 'forceDelete'])->name('surat-masuk.force-delete');
        Route::get('surat-masuk/{id}/cetak-kartu', [SuratMasukController::class, 'cetakKartu'])->name('surat-masuk.cetak-kartu');
        Route::post('surat-masuk/{id}/cetak-disposisi', [SuratMasukController::class, 'cetakDisposisi'])->name('surat-masuk.cetak-disposisi');
        Route::get('surat-masuk/{id}/cetak-isi', [SuratMasukController::class, 'cetakIsi'])->name('surat-masuk.cetak-isi');
        Route::get('surat-masuk/{id}/download', [SuratMasukController::class, 'downloadFile'])->name('surat-masuk.download');

        // Surat Keluar Routes
        Route::resource('surat-keluar', SuratKeluarController::class);
        Route::post('surat-keluar/{id}/restore', [SuratKeluarController::class, 'restore'])->name('surat-keluar.restore');
        Route::delete('surat-keluar/{id}/force-delete', [SuratKeluarController::class, 'forceDelete'])->name('surat-keluar.force-delete');
        Route::get('surat-keluar/{id}/cetak-kartu', [SuratKeluarController::class, 'cetakKartu'])->name('surat-keluar.cetak-kartu');
        Route::get('surat-keluar/{id}/download', [SuratKeluarController::class, 'downloadFile'])->name('surat-keluar.download');

        // Archive Routes
        Route::get('archive', [ArchiveController::class, 'index'])->name('archive.index');
        Route::post('archive/{type}/{id}/restore', [ArchiveController::class, 'restore'])->name('archive.restore');
        Route::delete('archive/{type}/{id}/force-delete', [ArchiveController::class, 'forceDelete'])->name('archive.force-delete');
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
    Route::get('/cuti/archive', function () {
        return Inertia::render('ComingSoon');
    })->name('cuti.archive');
});

require __DIR__ . '/auth.php';
