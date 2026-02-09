<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Models\Penjadwalan;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PenjadwalanArchiveController extends Controller
{
    /**
     * Display a listing of archived (soft deleted) penjadwalan.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Penjadwalan::class);

        $search = $request->input('search');

        return Inertia::render('Penjadwalan/Archive/Index', [
            'archived' => Inertia::defer(fn() => CacheHelper::tags(['penjadwalan'])->remember("archive_{$search}", 60, function () use ($search) {
                return Penjadwalan::query()
                    ->onlyTrashed()
                    ->with(['suratMasuk', 'creator', 'deleter'])
                    ->when($search, function ($query, $search) {
                        $query->where(function ($q) use ($search) {
                            $q->where('nama_kegiatan', 'ilike', "%{$search}%")
                                ->orWhere('tempat', 'ilike', "%{$search}%")
                                ->orWhereHas('suratMasuk', function ($sq) use ($search) {
                                    $sq->where('nomor_surat', 'ilike', "%{$search}%")
                                        ->orWhere('asal_surat', 'ilike', "%{$search}%")
                                        ->orWhere('perihal', 'ilike', "%{$search}%");
                                });
                        });
                    })
                    ->latest('deleted_at')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'nama_kegiatan' => $item->nama_kegiatan,
                            'tanggal_agenda' => $item->tanggal_agenda?->format('Y-m-d'),
                            'tanggal_agenda_formatted' => $item->tanggal_formatted,
                            'waktu_lengkap' => $item->waktu_lengkap,
                            'tempat' => $item->tempat,
                            'status' => $item->status,
                            'status_label' => $item->status_label,
                            'status_disposisi' => $item->status_disposisi,
                            'status_disposisi_label' => $item->status_disposisi_label,
                            'surat_masuk' => $item->suratMasuk ? [
                                'id' => $item->suratMasuk->id,
                                'nomor_surat' => $item->suratMasuk->nomor_surat,
                                'asal_surat' => $item->suratMasuk->asal_surat,
                                'perihal' => $item->suratMasuk->perihal,
                            ] : null,
                            'deleted_by' => $item->deleter ? [
                                'id' => $item->deleter->id,
                                'name' => $item->deleter->name,
                            ] : null,
                            'deleted_at' => $item->deleted_at?->format('Y-m-d H:i:s'),
                            'deleted_at_formatted' => $item->deleted_at?->translatedFormat('d M Y H:i'),
                        ];
                    });
            })),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore the specified archived penjadwalan.
     */
    public function restore(string $id)
    {
        $penjadwalan = Penjadwalan::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $penjadwalan);

        DB::beginTransaction();
        try {
            // Clear deleted_by before restore
            $penjadwalan->deleted_by = null;
            $penjadwalan->save();

            $penjadwalan->restore();

            CacheHelper::flush(['penjadwalan']);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Jadwal berhasil dipulihkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memulihkan jadwal', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal memulihkan jadwal. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Permanently delete the specified archived penjadwalan.
     */
    public function forceDelete(string $id)
    {
        $penjadwalan = Penjadwalan::onlyTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $penjadwalan);

        DB::beginTransaction();
        try {
            $penjadwalan->forceDelete();

            CacheHelper::flush(['penjadwalan']);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Jadwal berhasil dihapus permanen.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus jadwal', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal menghapus jadwal. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Restore all archived penjadwalan.
     */
    public function restoreAll()
    {
        $this->authorize('viewAny', Penjadwalan::class);

        DB::beginTransaction();
        try {
            $count = Penjadwalan::onlyTrashed()->count();

            Penjadwalan::onlyTrashed()->update(['deleted_by' => null]);
            Penjadwalan::onlyTrashed()->restore();

            CacheHelper::flush(['penjadwalan']);

            DB::commit();

            return redirect()->back()
                ->with('success', "{$count} jadwal berhasil dipulihkan.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memulihkan semua jadwal', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal memulihkan semua jadwal. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Permanently delete all archived penjadwalan.
     */
    public function forceDeleteAll()
    {
        $this->authorize('viewAny', Penjadwalan::class);

        DB::beginTransaction();
        try {
            $count = Penjadwalan::onlyTrashed()->count();

            Penjadwalan::onlyTrashed()->forceDelete();

            CacheHelper::flush(['penjadwalan']);

            DB::commit();

            return redirect()->back()
                ->with('success', "{$count} jadwal berhasil dihapus permanen.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus semua jadwal', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal menghapus semua jadwal. Silakan coba lagi atau hubungi administrator.');
        }
    }
}

