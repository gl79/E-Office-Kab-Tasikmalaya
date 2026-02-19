<?php

use App\Http\Controllers\Persuratan\ArchiveController;
use App\Http\Controllers\Persuratan\SuratKeluarController;
use App\Http\Controllers\Persuratan\SuratMasukController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('persuratan')->name('persuratan.')->group(function () {
    // Surat Masuk Routes
    Route::resource('surat-masuk', SuratMasukController::class)->except(['show']);
    Route::post('surat-masuk/{id}/restore', [SuratMasukController::class, 'restore'])->name('surat-masuk.restore');
    Route::delete('surat-masuk/{id}/force-delete', [SuratMasukController::class, 'forceDelete'])->name('surat-masuk.force-delete');
    Route::get('surat-masuk/{id}/cetak-kartu', [SuratMasukController::class, 'cetakKartu'])->name('surat-masuk.cetak-kartu');
    Route::post('surat-masuk/{id}/cetak-disposisi', [SuratMasukController::class, 'cetakDisposisi'])->name('surat-masuk.cetak-disposisi');
    Route::post('surat-masuk/{id}/terima', [SuratMasukController::class, 'terima'])->name('surat-masuk.terima');
    Route::get('surat-masuk/{id}/cetak-isi', [SuratMasukController::class, 'cetakIsi'])->name('surat-masuk.cetak-isi');
    Route::get('surat-masuk/{id}/preview', [SuratMasukController::class, 'previewFile'])->name('surat-masuk.preview');
    Route::get('surat-masuk/{id}/download', [SuratMasukController::class, 'downloadFile'])->name('surat-masuk.download');

    // Surat Keluar Routes
    Route::resource('surat-keluar', SuratKeluarController::class)->except(['show']);
    Route::post('surat-keluar/{id}/restore', [SuratKeluarController::class, 'restore'])->name('surat-keluar.restore');
    Route::delete('surat-keluar/{id}/force-delete', [SuratKeluarController::class, 'forceDelete'])->name('surat-keluar.force-delete');
    Route::get('surat-keluar/{id}/cetak-kartu', [SuratKeluarController::class, 'cetakKartu'])->name('surat-keluar.cetak-kartu');
    Route::get('surat-keluar/{id}/cetak-isi', [SuratKeluarController::class, 'cetakIsi'])->name('surat-keluar.cetak-isi');
    Route::get('surat-keluar/{id}/preview', [SuratKeluarController::class, 'previewFile'])->name('surat-keluar.preview');
    Route::get('surat-keluar/{id}/download', [SuratKeluarController::class, 'downloadFile'])->name('surat-keluar.download');

    // Archive Routes
    Route::get('archive', [ArchiveController::class, 'index'])->name('archive.index');
    Route::post('archive/{type}/{id}/restore', [ArchiveController::class, 'restore'])->name('archive.restore');
    Route::delete('archive/{type}/{id}/force-delete', [ArchiveController::class, 'forceDelete'])->name('archive.force-delete');
    Route::post('archive/restore-all', [ArchiveController::class, 'restoreAll'])->name('archive.restore-all');
    Route::delete('archive/force-delete-all', [ArchiveController::class, 'forceDeleteAll'])->name('archive.force-delete-all');
});
