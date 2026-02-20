<?php

use App\Http\Controllers\Master\JenisSuratController;
use App\Http\Controllers\Master\PenggunaController;
use App\Http\Controllers\Master\SifatSuratController;
use App\Http\Controllers\Master\UnitKerjaController;
use App\Http\Controllers\Master\IndeksSuratController;
use App\Http\Controllers\Master\Wilayah\DesaController;
use App\Http\Controllers\Master\Wilayah\KabupatenController;
use App\Http\Controllers\Master\Wilayah\KecamatanController;
use App\Http\Controllers\Master\Wilayah\ProvinsiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('master')->name('master.')->group(function () {

    // Pengguna CRUD
    Route::get('/pengguna', [PenggunaController::class, 'index'])->name('pengguna.index');
    Route::post('/pengguna', [PenggunaController::class, 'store'])->name('pengguna.store');
    Route::patch('/pengguna/{pengguna}', [PenggunaController::class, 'update'])->name('pengguna.update');
    Route::delete('/pengguna/{pengguna}', [PenggunaController::class, 'destroy'])->name('pengguna.destroy');
    Route::get('/pengguna/archive', [PenggunaController::class, 'archive'])->name('pengguna.archive');
    Route::post('/pengguna/{id}/restore', [PenggunaController::class, 'restore'])->name('pengguna.restore');
    Route::delete('/pengguna/{id}/force-delete', [PenggunaController::class, 'forceDelete'])->name('pengguna.force-delete');

    // Unit Kerja
    Route::resource('unit-kerja', UnitKerjaController::class)->except(['create', 'show', 'edit']);

    // Indeks Surat
    Route::get('indeks-surat/next-kode/{parentId}', [IndeksSuratController::class, 'nextKode'])->name('indeks-surat.next-kode');
    Route::resource('indeks-surat', IndeksSuratController::class)->except(['create', 'show', 'edit']);

    // Jenis Surat
    Route::resource('jenis-surat', JenisSuratController::class)->except(['create', 'show', 'edit']);

    // Sifat Surat
    Route::resource('sifat-surat', SifatSuratController::class)->except(['create', 'show', 'edit']);

    // Wilayah Routes
    Route::prefix('wilayah')->name('wilayah.')->group(function () {
        Route::get('provinsi/all', [ProvinsiController::class, 'getAll'])->name('provinsi.all');
        Route::resource('provinsi', ProvinsiController::class)->except(['create', 'show', 'edit']);

        Route::get('kabupaten', [KabupatenController::class, 'index'])->name('kabupaten.index');
        Route::post('kabupaten', [KabupatenController::class, 'store'])->name('kabupaten.store');
        Route::put('kabupaten/{provinsi_kode}/{kode}', [KabupatenController::class, 'update'])->name('kabupaten.update');
        Route::delete('kabupaten/{provinsi_kode}/{kode}', [KabupatenController::class, 'destroy'])->name('kabupaten.destroy');
        Route::get('kabupaten/by-provinsi/{provinsiKode}', [KabupatenController::class, 'getKabupatenByProvinsi'])->name('kabupaten.by-provinsi');

        Route::get('kecamatan', [KecamatanController::class, 'index'])->name('kecamatan.index');
        Route::post('kecamatan', [KecamatanController::class, 'store'])->name('kecamatan.store');
        Route::put('kecamatan/{provinsi_kode}/{kabupaten_kode}/{kode}', [KecamatanController::class, 'update'])->name('kecamatan.update');
        Route::delete('kecamatan/{provinsi_kode}/{kabupaten_kode}/{kode}', [KecamatanController::class, 'destroy'])->name('kecamatan.destroy');
        Route::get('kecamatan/by-kabupaten/{provinsiKode}/{kabupatenKode}', [KecamatanController::class, 'getKecamatanByKabupaten'])->name('kecamatan.by-kabupaten');

        Route::get('desa', [DesaController::class, 'index'])->name('desa.index');
        Route::post('desa', [DesaController::class, 'store'])->name('desa.store');
        Route::put('desa/{provinsi_kode}/{kabupaten_kode}/{kecamatan_kode}/{kode}', [DesaController::class, 'update'])->name('desa.update');
        Route::delete('desa/{provinsi_kode}/{kabupaten_kode}/{kecamatan_kode}/{kode}', [DesaController::class, 'destroy'])->name('desa.destroy');
        Route::get('desa/by-kecamatan/{provinsiKode}/{kabupatenKode}/{kecamatanKode}', [DesaController::class, 'getDesaByKecamatan'])->name('desa.by-kecamatan');
    });
});
