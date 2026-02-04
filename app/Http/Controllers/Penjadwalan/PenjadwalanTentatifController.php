<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Jadwal\UpdateKehadiranRequest;
use App\Http\Resources\Penjadwalan\PenjadwalanResource;
use App\Models\Penjadwalan;
use App\Support\CacheHelper;
use App\Support\WilayahHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PenjadwalanTentatifController extends Controller
{
    /**
     * Display a listing of tentatif penjadwalan.
     * Tab: Menunggu Peninjauan & Sudah Ditinjau
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Penjadwalan::class);

        $search = $request->input('search');

        return Inertia::render('Penjadwalan/Tentatif/Index', [
            'menungguPeninjauan' => Inertia::defer(fn() => CacheHelper::tags(['penjadwalan'])->remember("tentatif_menunggu_{$search}", 60, function () use ($search) {
                $query = Penjadwalan::query()
                    ->menungguPeninjauan()
                    ->with(['suratMasuk', 'creator'])
                    ->search($search)
                    ->latest('tanggal_agenda')
                    ->get();
                return PenjadwalanResource::collection($query);
            })),
            'sudahDitinjau' => Inertia::defer(fn() => CacheHelper::tags(['penjadwalan'])->remember("tentatif_sudah_{$search}", 60, function () use ($search) {
                $query = Penjadwalan::query()
                    ->sudahDitinjau()
                    ->with(['suratMasuk', 'creator'])
                    ->search($search)
                    ->latest('tanggal_agenda')
                    ->get();
                return PenjadwalanResource::collection($query);
            })),
            'disposisiOptions' => Penjadwalan::DISPOSISI_OPTIONS,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Update kehadiran/disposisi (only by creator)
     */
    public function updateKehadiran(UpdateKehadiranRequest $request, string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('update', $penjadwalan);

        DB::beginTransaction();
        try {
            $data = $request->validated();

            $penjadwalan->update([
                'dihadiri_oleh' => $data['dihadiri_oleh'],
                'status_disposisi' => $data['status_disposisi'],
                'keterangan' => $data['keterangan'] ?? $penjadwalan->keterangan,
            ]);

            DB::commit();

            CacheHelper::flush(['penjadwalan']);

            return redirect()->back()
                ->with('success', 'Kehadiran berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal memperbarui kehadiran: ' . $e->getMessage());
        }
    }

    /**
     * Change status from tentatif to definitif
     */
    public function jadikanDefinitif(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('update', $penjadwalan);

        // Validasi: hanya penjadwalan yang sudah ditinjau yang bisa jadi definitif
        if ($penjadwalan->status_disposisi === Penjadwalan::DISPOSISI_MENUNGGU) {
            return redirect()->back()
                ->with('error', 'Jadwal masih menunggu peninjauan. Harap perbarui status disposisi terlebih dahulu.');
        }

        DB::beginTransaction();
        try {
            $penjadwalan->update([
                'status' => Penjadwalan::STATUS_DEFINITIF,
            ]);

            DB::commit();

            CacheHelper::flush(['penjadwalan']);

            return redirect()->back()
                ->with('success', 'Jadwal berhasil dijadikan definitif.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal mengubah status: ' . $e->getMessage());
        }
    }

    /**
     * Generate WhatsApp template for export
     */
    public function exportWhatsApp(string $id)
    {
        $penjadwalan = Penjadwalan::with(['suratMasuk'])->findOrFail($id);
        $this->authorize('view', $penjadwalan);

        $template = $this->generateWhatsAppTemplate($penjadwalan);

        return response()->json([
            'template' => $template,
        ]);
    }

    /**
     * Generate formatted WhatsApp message template
     */
    private function generateWhatsAppTemplate(Penjadwalan $penjadwalan): string
    {
        $hari = $penjadwalan->tanggal_agenda?->translatedFormat('l');
        $tanggal = $penjadwalan->tanggal_agenda?->translatedFormat('d F Y');
        $waktu = $penjadwalan->waktu_lengkap;
        $kegiatan = $penjadwalan->nama_kegiatan;
        $tempat = $penjadwalan->tempat;

        // Build wilayah info if dalam daerah (using cached helper to avoid N+1)
        $wilayahInfo = '';
        if ($penjadwalan->lokasi_type === Penjadwalan::LOKASI_DALAM_DAERAH && $penjadwalan->kode_wilayah) {
            $wilayahInfo = WilayahHelper::getWilayahText($penjadwalan->kode_wilayah);
        }

        $kehadiran = $penjadwalan->dihadiri_oleh ?: 'Menunggu Konfirmasi';
        $statusDisposisi = $penjadwalan->status_disposisi_label;
        $keterangan = $penjadwalan->keterangan;

        $template = "RENCANA KEGIATAN BUPATI\n\n";
        $template .= "Hari/Tanggal : {$hari}, {$tanggal}\n";
        $template .= "Waktu        : {$waktu} WIB\n";
        $template .= "Kegiatan     : {$kegiatan}\n";
        $template .= "Tempat       : {$tempat}";

        if ($wilayahInfo) {
            $template .= "\n              {$wilayahInfo}";
        }

        $template .= "\n\n";
        $template .= "Kehadiran    : {$kehadiran}\n";
        $template .= "Status       : {$statusDisposisi}";

        if ($keterangan) {
            $template .= "\n\n{$keterangan}";
        }

        $template .= "\n\n---\n";
        $template .= "Dikirim dari Sistem E-Office";

        return $template;
    }

    /**
     * Delete penjadwalan (soft delete)
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

