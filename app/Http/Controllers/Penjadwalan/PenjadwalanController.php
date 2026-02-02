<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Jadwal\StorePenjadwalanRequest;
use App\Http\Requests\Jadwal\UpdatePenjadwalanRequest;
use App\Http\Resources\PenjadwalanResource;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $tab = $request->input('tab', 'belum');
        $search = $request->input('search');

        $query = SuratMasuk::query()
            ->with(['tujuans', 'indeksBerkas']);

        // Apply Tab Filter
        if ($tab === 'sudah') {
            $query->sudahDijadwalkan()->with('penjadwalan.creator');
        } else {
            $query->belumDijadwalkan();
        }

        // Apply Search
        if ($search) {
            $query->search($search);
            // Also search in Agenda if tab is 'sudah'
            if ($tab === 'sudah') {
                $query->orWhereHas('penjadwalan', function ($q) use ($search) {
                    $q->where('nama_kegiatan', 'like', "%{$search}%");
                });
            }
        }

        $suratMasuk = $query->latest('tanggal_diterima')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($surat) {
                return [
                    'id' => $surat->id,
                    'nomor_agenda' => $surat->nomor_agenda,
                    'nomor_surat' => $surat->nomor_surat,
                    'tanggal_surat' => $surat->tanggal_surat?->format('Y-m-d'),
                    'tanggal_surat_formatted' => $surat->tanggal_surat_formatted,
                    'tanggal_diterima' => $surat->tanggal_diterima?->format('Y-m-d'),
                    'tanggal_diterima_formatted' => $surat->tanggal_diterima_formatted,
                    'asal_surat' => $surat->asal_surat,
                    'perihal' => $surat->perihal,
                    'sifat' => $surat->sifat,
                    'sifat_label' => $surat->sifat_label,
                    'file_path' => $surat->file_path,
                    'file_url' => $surat->file_path ? Storage::url($surat->file_path) : null,
                    'tujuan_list' => $surat->tujuan_list,
                    'agenda' => $surat->penjadwalan ? [
                        'id' => $surat->penjadwalan->id,
                        'nama_kegiatan' => $surat->penjadwalan->nama_kegiatan,
                        'tanggal_agenda' => $surat->penjadwalan->tanggal_agenda?->format('Y-m-d'),
                        'tanggal_agenda_formatted' => $surat->penjadwalan->tanggal_formatted,
                        'waktu_lengkap' => $surat->penjadwalan->waktu_lengkap,
                        'tempat' => $surat->penjadwalan->tempat,
                        'status' => $surat->penjadwalan->status,
                        'status_label' => $surat->penjadwalan->status_label,
                        'status_disposisi' => $surat->penjadwalan->status_disposisi,
                        'status_disposisi_label' => $surat->penjadwalan->status_disposisi_label,
                    ] : null,
                ];
            });

        return Inertia::render('Penjadwalan/Jadwal/Index', [
            'suratMasuk' => $suratMasuk,
            'activeTab' => $tab,
            'lokasiTypeOptions' => Penjadwalan::LOKASI_TYPE_OPTIONS,
            'filters' => $request->only(['search', 'tab']),
        ]);
    }

    /**
     * Get detail surat masuk for scheduling form
     */
    public function getSuratMasuk(string $id)
    {
        $suratMasuk = SuratMasuk::with(['tujuans', 'indeksBerkas', 'penjadwalan'])
            ->findOrFail($id);

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

            return redirect()->route('penjadwalan.index')
                ->with('success', 'Jadwal berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menyimpan jadwal: ' . $e->getMessage());
        }
    }

    /**
     * Get penjadwalan detail for editing
     */
    public function show(string $id)
    {
        $penjadwalan = Penjadwalan::with(['suratMasuk', 'creator', 'updater'])
            ->findOrFail($id);

        return response()->json(new PenjadwalanResource($penjadwalan));
    }

    /**
     * Update the specified penjadwalan in storage.
     */
    public function update(UpdatePenjadwalanRequest $request, string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);

        DB::beginTransaction();
        try {
            $data = $request->validated();

            $penjadwalan->update($data);

            DB::commit();

            return redirect()->route('penjadwalan.index')
                ->with('success', 'Jadwal berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui jadwal: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified penjadwalan from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);

        $penjadwalan->delete();

        return redirect()->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }
}
