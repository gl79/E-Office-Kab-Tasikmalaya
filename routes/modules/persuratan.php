<?php

use App\Http\Controllers\Persuratan\SuratKeluarController;
use App\Http\Controllers\Persuratan\SuratMasukController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('persuratan')->name('persuratan.')->group(function () {
    // Surat Masuk Routes
    Route::resource('surat-masuk', SuratMasukController::class)->except(['show']);
    Route::get('surat-masuk/{id}/cetak-kartu', [SuratMasukController::class, 'cetakKartu'])->name('surat-masuk.cetak-kartu');
    Route::post('surat-masuk/{id}/cetak-disposisi', [SuratMasukController::class, 'cetakDisposisi'])->name('surat-masuk.cetak-disposisi');
    Route::post('surat-masuk/{id}/terima', [SuratMasukController::class, 'terima'])->name('surat-masuk.terima');
    Route::get('surat-masuk/{id}/cetak-isi', [SuratMasukController::class, 'cetakIsi'])->name('surat-masuk.cetak-isi');
    Route::get('surat-masuk/{id}/preview', [SuratMasukController::class, 'previewFile'])->name('surat-masuk.preview');
    Route::get('surat-masuk/{id}/download', [SuratMasukController::class, 'downloadFile'])->name('surat-masuk.download');

    // Surat Keluar Routes
    Route::resource('surat-keluar', SuratKeluarController::class)->except(['show']);
    Route::get('surat-keluar/{id}/cetak-kartu', [SuratKeluarController::class, 'cetakKartu'])->name('surat-keluar.cetak-kartu');
    Route::get('surat-keluar/{id}/cetak-isi', [SuratKeluarController::class, 'cetakIsi'])->name('surat-keluar.cetak-isi');
    Route::get('surat-keluar/{id}/preview', [SuratKeluarController::class, 'previewFile'])->name('surat-keluar.preview');
    Route::get('surat-keluar/{id}/download', [SuratKeluarController::class, 'downloadFile'])->name('surat-keluar.download');
});
