<?php

namespace App\Http\Controllers\Persuratan;

use App\Http\Controllers\Controller;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    /**
     * Display a listing of archived surat masuk and surat keluar.
     */
    public function index(Request $request)
    {
        // Get all trashed surat masuk for client-side filtering
        $suratMasuk = SuratMasuk::onlyTrashed()
            ->with(['deletedBy'])
            ->latest('deleted_at')
            ->get()
            ->map(function ($item) {
                $item->jenis = 'Surat Masuk';
                $item->type = 'masuk';
                return $item;
            });

        // Get all trashed surat keluar for client-side filtering
        $suratKeluar = SuratKeluar::onlyTrashed()
            ->with(['deletedBy'])
            ->latest('deleted_at')
            ->get()
            ->map(function ($item) {
                $item->jenis = 'Surat Keluar';
                $item->type = 'keluar';
                $item->nomor_agenda = '-';
                $item->asal_surat = $item->kepada;
                return $item;
            });

        // Merge and sort by deleted_at
        $archives = $suratMasuk->merge($suratKeluar)->sortByDesc('deleted_at')->values();

        return Inertia::render('Persuratan/Archive/Index', [
            'archives' => $archives,
        ]);
    }

    /**
     * Restore the specified resource from archive.
     */
    public function restore(string $type, string $id)
    {
        if ($type === 'masuk') {
            $surat = SuratMasuk::onlyTrashed()->findOrFail($id);
            $this->authorize('restore', $surat);
            $surat->restore();
            $message = 'Surat Masuk berhasil dipulihkan.';
        } elseif ($type === 'keluar') {
            $surat = SuratKeluar::onlyTrashed()->findOrFail($id);
            $this->authorize('restore', $surat);
            $surat->restore();
            $message = 'Surat Keluar berhasil dipulihkan.';
        } else {
            return redirect()->back()->with('error', 'Tipe surat tidak valid.');
        }

        Cache::tags(['persuratan_archive'])->flush();

        return redirect()->back()->with('success', $message);
    }

    /**
     * Permanently delete the specified resource from archive.
     */
    public function forceDelete(string $type, string $id)
    {
        if ($type === 'masuk') {
            $surat = SuratMasuk::onlyTrashed()->findOrFail($id);
            $this->authorize('forceDelete', $surat);

            // Delete file
            if ($surat->file_path) {
                Storage::disk('public')->delete($surat->file_path);
            }

            $surat->forceDelete();
            $message = 'Surat Masuk berhasil dihapus permanen.';
        } elseif ($type === 'keluar') {
            $surat = SuratKeluar::onlyTrashed()->findOrFail($id);
            $this->authorize('forceDelete', $surat);

            // Delete file
            if ($surat->file_path) {
                Storage::disk('public')->delete($surat->file_path);
            }

            $surat->forceDelete();
            $message = 'Surat Keluar berhasil dihapus permanen.';
        } else {
            return redirect()->back()->with('error', 'Tipe surat tidak valid.');
        }

        Cache::tags(['persuratan_archive'])->flush();

        return redirect()->back()->with('success', $message);
    }
}
