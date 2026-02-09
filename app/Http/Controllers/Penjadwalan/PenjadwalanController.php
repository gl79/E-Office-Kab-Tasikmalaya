<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Jadwal\StorePenjadwalanRequest;
use App\Http\Requests\Jadwal\UpdatePenjadwalanRequest;
use App\Http\Resources\Penjadwalan\PenjadwalanResource;
use App\Http\Resources\Penjadwalan\SuratMasukJadwalResource;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PenjadwalanController extends Controller
{
    /**
     * Display a listing of surat masuk for scheduling.
     * Tab: Belum Dijadwalkan & Sudah Dijadwalkan
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Penjadwalan::class);

        $tab = $request->input('tab', 'belum');

        // Build query based on tab - search handled client-side for realtime filtering
        $belumQuery = SuratMasuk::query()
            ->with(['tujuans', 'indeksBerkas'])
            ->belumDijadwalkan();

        $sudahQuery = SuratMasuk::query()
            ->with(['tujuans', 'indeksBerkas', 'penjadwalan.creator'])
            ->sudahDijadwalkan();

        return Inertia::render('Penjadwalan/Jadwal/Index', [
            'belumDijadwalkan' => Inertia::defer(fn() => CacheHelper::tags(['penjadwalan'])->remember(
                'jadwal_belum_dijadwalkan',
                60,
                fn() => SuratMasukJadwalResource::collection($belumQuery->latest('tanggal_diterima')->get())
            )),
            'sudahDijadwalkan' => Inertia::defer(fn() => CacheHelper::tags(['penjadwalan'])->remember(
                'jadwal_sudah_dijadwalkan',
                60,
                fn() => SuratMasukJadwalResource::collection($sudahQuery->latest('tanggal_diterima')->get())
            )),
            'activeTab' => $tab,
            'lokasiTypeOptions' => Penjadwalan::LOKASI_TYPE_OPTIONS,
        ]);
    }

    /**
     * Get detail surat masuk for scheduling form
     */
    public function getSuratMasuk(string $id)
    {
        $suratMasuk = SuratMasuk::with(['tujuans', 'indeksBerkas', 'penjadwalan'])
            ->findOrFail($id);
        $this->authorize('view', $suratMasuk);

        return response()->json([
            'id' => $suratMasuk->id,
            'nomor_agenda' => $suratMasuk->nomor_agenda,
            'nomor_surat' => $suratMasuk->nomor_surat,
            'tanggal_surat' => $suratMasuk->tanggal_surat?->format('Y-m-d'),
            'tanggal_surat_formatted' => $suratMasuk->tanggal_surat_formatted,
            'tanggal_diterima' => $suratMasuk->tanggal_diterima?->format('Y-m-d'),
            'tanggal_diterima_formatted' => $suratMasuk->tanggal_diterima_formatted,
            'asal_surat' => $suratMasuk->asal_surat,
            'perihal' => $suratMasuk->perihal,
            'sifat' => $suratMasuk->sifat,
            'sifat_label' => $suratMasuk->sifat_label,
            'file_path' => $suratMasuk->file_path,
            'file_url' => $suratMasuk->file_path ? Storage::url($suratMasuk->file_path) : null,
            'tujuan_list' => $suratMasuk->tujuan_list,
            'has_agenda' => $suratMasuk->hasPenjadwalan(),
            'agenda' => $suratMasuk->penjadwalan ? new PenjadwalanResource($suratMasuk->penjadwalan->load(['suratMasuk', 'creator'])) : null,
        ]);
    }

    /**
     * Store a newly created penjadwalan in storage.
     */
    public function store(StorePenjadwalanRequest $request)
    {
        $this->authorize('create', Penjadwalan::class);

        DB::beginTransaction();
        try {
            $data = $request->validated();

            // Check if surat masuk already has penjadwalan
            $suratMasuk = SuratMasuk::findOrFail($data['surat_masuk_id']);
            if ($suratMasuk->hasPenjadwalan()) {
                return redirect()->back()
                    ->with('error', 'Surat masuk ini sudah memiliki jadwal.');
            }

            // Set default status
            $data['status'] = Penjadwalan::STATUS_TENTATIF;
            $data['status_disposisi'] = Penjadwalan::DISPOSISI_MENUNGGU;

            // Create penjadwalan
            $penjadwalan = Penjadwalan::create($data);

            DB::commit();

            CacheHelper::flush(['penjadwalan']);

            return redirect()->route('penjadwalan.index')
                ->with('success', 'Jadwal berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan jadwal', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menyimpan jadwal. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Get penjadwalan detail for editing
     */
    public function show(string $id)
    {
        $penjadwalan = Penjadwalan::with(['suratMasuk', 'creator', 'updater'])
            ->findOrFail($id);
        $this->authorize('view', $penjadwalan);

        return response()->json(new PenjadwalanResource($penjadwalan));
    }

    /**
     * Update the specified penjadwalan in storage.
     */
    public function update(UpdatePenjadwalanRequest $request, string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('update', $penjadwalan);

        DB::beginTransaction();
        try {
            $data = $request->validated();

            $penjadwalan->update($data);

            DB::commit();

            CacheHelper::flush(['penjadwalan']);

            return redirect()->route('penjadwalan.index')
                ->with('success', 'Jadwal berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memperbarui jadwal', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui jadwal. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Remove the specified penjadwalan from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('delete', $penjadwalan);

        $penjadwalan->delete();

        CacheHelper::flush(['penjadwalan']);

        return redirect()->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }
}

