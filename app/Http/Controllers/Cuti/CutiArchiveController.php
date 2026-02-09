<?php

namespace App\Http\Controllers\Cuti;

use App\Http\Controllers\Controller;
use App\Models\Cuti;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CutiArchiveController extends Controller
{
    /**
     * Display a listing of archived (soft deleted) cuti.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Cuti::class);

        $search = $request->input('search');
        $cacheKey = 'cuti_archive_' . md5((string) $search);

        return Inertia::render('Cuti/Archive/Index', [
            'archived' => Inertia::defer(fn() => CacheHelper::tags(['cuti'])->remember($cacheKey, 60, function () use ($search) {
                return Cuti::query()
                    ->onlyTrashed()
                    ->search($search)
                    ->latest('deleted_at')
                    ->get()
                    ->map(function (Cuti $item) {
                        return [
                            'id' => $item->id,
                            'pegawai' => [
                                'name' => $item->nama_pegawai,
                                'nip' => $item->nip_pegawai,
                                'jabatan' => $item->jabatan_pegawai,
                            ],
                            'atasan' => $item->nama_atasan ? [
                                'name' => $item->nama_atasan,
                                'nip' => $item->nip_atasan,
                                'jabatan' => $item->jabatan_atasan,
                            ] : null,
                            'jenis_cuti' => $item->jenis_cuti,
                            'lama_cuti' => $item->lama_cuti,
                            'tanggal_range_formatted' => $item->tanggal_range_formatted,
                            'status' => $item->status,
                            'status_label' => $item->status_label,
                            'deleted_at' => $item->deleted_at?->format('Y-m-d H:i:s'),
                            'deleted_at_formatted' => $item->deleted_at?->translatedFormat('d M Y H:i'),
                        ];
                    });
            })),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore the specified archived cuti.
     */
    public function restore(string $id)
    {
        $cuti = Cuti::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $cuti);

        DB::beginTransaction();
        try {
            $cuti->deleted_by = null;
            $cuti->save();

            $cuti->restore();

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Pengajuan cuti berhasil dipulihkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memulihkan pengajuan cuti', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal memulihkan pengajuan cuti. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Permanently delete the specified archived cuti.
     */
    public function forceDelete(string $id)
    {
        $cuti = Cuti::onlyTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $cuti);

        DB::beginTransaction();
        try {
            $cuti->forceDelete();

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Pengajuan cuti berhasil dihapus permanen.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus pengajuan cuti', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal menghapus pengajuan cuti. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Restore all archived cuti.
     */
    public function restoreAll()
    {
        $this->authorize('viewAny', Cuti::class);

        DB::beginTransaction();
        try {
            $count = Cuti::onlyTrashed()->count();

            Cuti::onlyTrashed()->update(['deleted_by' => null]);
            Cuti::onlyTrashed()->restore();

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->back()
                ->with('success', "{$count} pengajuan cuti berhasil dipulihkan.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memulihkan semua pengajuan cuti', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal memulihkan semua pengajuan cuti. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Permanently delete all archived cuti.
     */
    public function forceDeleteAll()
    {
        $this->authorize('viewAny', Cuti::class);

        DB::beginTransaction();
        try {
            $count = Cuti::onlyTrashed()->count();

            Cuti::onlyTrashed()->forceDelete();

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->back()
                ->with('success', "{$count} pengajuan cuti berhasil dihapus permanen.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus semua pengajuan cuti', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal menghapus semua pengajuan cuti. Silakan coba lagi atau hubungi administrator.');
        }
    }
}
