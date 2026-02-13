<?php

namespace App\Http\Controllers\Persuratan;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\HandlesArchive;
use App\Models\SifatSurat;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    use HandlesArchive;
    /**
     * Display a listing of archived surat masuk and surat keluar.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', SuratMasuk::class);
        $this->authorize('viewAny', SuratKeluar::class);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $cacheKey = 'persuratan_archive_index_' . $user->id . '_' . md5(json_encode($request->query()));

        return Inertia::render('Persuratan/Archive/Index', [
            'archives' => Inertia::defer(fn() => CacheHelper::tags(['persuratan_archive'])->remember($cacheKey, 60, function () use ($user) {
                // Build surat masuk query with role-based filtering
                $masukQuery = SuratMasuk::onlyTrashed()
                    ->with(['deletedBy'])
                    ->latest('deleted_at');

                if (!$user->isSuperAdmin()) {
                    if ($user->isTU()) {
                        $masukQuery->where(function ($q) use ($user) {
                            $q->whereIn('id', function ($subq) use ($user) {
                                $subq->select('surat_masuk_id')
                                    ->from('surat_masuk_tujuans')
                                    ->where('tujuan_id', $user->id);
                            })
                            ->orWhere(function ($subq) use ($user) {
                                $subq->where('created_by', $user->id)
                                    ->whereNotExists(function ($existsQuery) use ($user) {
                                        $existsQuery->select(DB::raw(1))
                                            ->from('surat_keluars')
                                            ->whereColumn('surat_keluars.nomor_surat', 'surat_masuks.nomor_surat')
                                            ->where('surat_keluars.created_by', $user->id);
                                    });
                            });
                        });
                    } else {
                        $masukQuery->whereIn('id', function ($q) use ($user) {
                            $q->select('surat_masuk_id')
                                ->from('surat_masuk_tujuans')
                                ->where('tujuan_id', $user->id);
                        });
                    }
                }

                $suratMasuk = $masukQuery->get()->map(function ($item) {
                    $item->jenis = 'Surat Masuk';
                    $item->type = 'masuk';
                    return $item;
                });

                // Build surat keluar query with role-based filtering
                $keluarQuery = SuratKeluar::onlyTrashed()
                    ->with(['deletedBy'])
                    ->latest('deleted_at');

                if (!$user->isSuperAdmin()) {
                    $keluarQuery->where('created_by', $user->id);
                }

                $suratKeluar = $keluarQuery->get()->map(function ($item) {
                    $item->jenis = 'Surat Keluar';
                    $item->type = 'keluar';
                    $item->nomor_agenda = $item->no_urut ? str_pad($item->no_urut, 4, '0', STR_PAD_LEFT) : '-';
                    $item->asal_surat = $item->kepada;
                    $item->sifat = $item->sifat_1;
                    return $item;
                });

                // Merge and sort by deleted_at
                return $suratMasuk->merge($suratKeluar)->sortByDesc('deleted_at')->values();
            })),
            'sifatOptions' => SifatSurat::getOptions(),
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

        CacheHelper::flush(['persuratan_archive', 'persuratan_list']);

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

        CacheHelper::flush(['persuratan_archive', 'persuratan_list']);

        return redirect()->back()->with('success', $message);
    }

    /**
     * Restore all archived surat.
     */
    public function restoreAll()
    {
        return $this->archiveTransaction(function () {
            $countMasuk = SuratMasuk::onlyTrashed()->count();
            $countKeluar = SuratKeluar::onlyTrashed()->count();

            SuratMasuk::onlyTrashed()->update(['deleted_by' => null]);
            SuratMasuk::onlyTrashed()->restore();

            SuratKeluar::onlyTrashed()->update(['deleted_by' => null]);
            SuratKeluar::onlyTrashed()->restore();

            $total = $countMasuk + $countKeluar;
            return "{$total} surat berhasil dipulihkan ({$countMasuk} surat masuk, {$countKeluar} surat keluar).";
        }, ['persuratan_archive', 'persuratan_list'], 'Gagal memulihkan semua surat');
    }

    /**
     * Permanently delete all archived surat.
     */
    public function forceDeleteAll()
    {
        return $this->archiveTransaction(function () {
            // Delete files for surat masuk
            SuratMasuk::onlyTrashed()->whereNotNull('file_path')->each(function ($surat) {
                Storage::disk('public')->delete($surat->file_path);
            });

            // Delete files for surat keluar
            SuratKeluar::onlyTrashed()->whereNotNull('file_path')->each(function ($surat) {
                Storage::disk('public')->delete($surat->file_path);
            });

            $countMasuk = SuratMasuk::onlyTrashed()->count();
            $countKeluar = SuratKeluar::onlyTrashed()->count();

            SuratMasuk::onlyTrashed()->forceDelete();
            SuratKeluar::onlyTrashed()->forceDelete();

            $total = $countMasuk + $countKeluar;
            return "{$total} surat berhasil dihapus permanen ({$countMasuk} surat masuk, {$countKeluar} surat keluar).";
        }, ['persuratan_archive'], 'Gagal menghapus semua surat');
    }
}
