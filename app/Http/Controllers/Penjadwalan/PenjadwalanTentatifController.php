<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Jadwal\UpdateKehadiranRequest;
use App\Http\Resources\Penjadwalan\PenjadwalanResource;
use App\Models\Penjadwalan;
use App\Models\SifatSurat;
use App\Models\SuratMasuk;
use App\Models\User;
use App\Services\Penjadwalan\PenjadwalanService;
use App\Support\CacheHelper;
use App\Support\WilayahHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PenjadwalanTentatifController extends Controller
{
    public function __construct(private readonly PenjadwalanService $service) {}

    /**
     * Display a listing of tentatif penjadwalan (semua status disposisi dalam 1 tabel).
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Penjadwalan::class);

        $search = $request->input('search');

        return Inertia::render('Penjadwalan/Tentatif/Index', [
            'tentatif' => Inertia::defer(fn() => CacheHelper::tags(['penjadwalan'])->remember("tentatif_all_{$search}", 60, function () use ($search) {
                $query = Penjadwalan::query()
                    ->tentatif()
                    ->with([
                        'suratMasuk.tujuans',
                        'suratMasuk.jenisSurat',
                        'suratMasuk.indeksBerkas',
                        'suratMasuk.kodeKlasifikasi',
                        'suratMasuk.staffPengolah',
                        'suratMasuk.createdBy',
                        'creator',
                    ])
                    ->search($search)
                    ->latest('tanggal_agenda')
                    ->get();
                return PenjadwalanResource::collection($query);
            })),
            'userOptions' => User::query()
                ->select(['id', 'name', 'nip', 'jabatan'])
                ->where('role', '!=', User::ROLE_SUPERADMIN)
                ->orderBy('name')
                ->get(),
            'disposisiOptions' => Penjadwalan::DISPOSISI_OPTIONS,
            'sifatOptions' => SifatSurat::getOptions(),
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

        try {
            $this->service->updateKehadiran($penjadwalan, $request->validated(), $request->user());

            return redirect()->back()
                ->with('success', 'Kehadiran berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Gagal memperbarui kehadiran', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal memperbarui kehadiran. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Change status from tentatif to definitif
     */
    public function jadikanDefinitif(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('update', $penjadwalan);

        try {
            $result = $this->service->promoteToDefinitif($penjadwalan, request()->user());

            return redirect()->back()
                ->with($result['success'] ? 'success' : 'error', $result['message']);
        } catch (\Exception $e) {
            Log::error('Gagal mengubah status', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal mengubah status. Silakan coba lagi atau hubungi administrator.');
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

        // Surat masuk identifiers
        $suratMasuk = $penjadwalan->suratMasuk;
        $noAgenda = '-';
        $noSurat = '-';
        $tanggalSurat = '-';
        $asalSurat = '-';
        $perihal = '-';
        if ($suratMasuk) {
            $naParts = explode('/', $suratMasuk->nomor_agenda ?? '');
            $noAgenda = count($naParts) >= 2 ? $naParts[1] : ($suratMasuk->nomor_agenda ?? '-');
            $noSurat = $suratMasuk->nomor_surat ?? '-';
            $tanggalSurat = $suratMasuk->tanggal_surat_formatted ?? '-';
            $asalSurat = $suratMasuk->asal_surat ?? '-';
            $perihal = $suratMasuk->perihal ?? '-';
        }

        $kehadiran = $penjadwalan->dihadiri_oleh ?: 'Menunggu Konfirmasi';
        $statusDisposisi = $penjadwalan->status_disposisi_label;
        $keterangan = $penjadwalan->keterangan;

        $template = "*RENCANA KEGIATAN BUPATI*\n\n";
        $template .= "*Hari/Tanggal :* {$hari}, {$tanggal}\n";
        $template .= "*Waktu        :* {$waktu} WIB\n";
        $template .= "*Kegiatan     :* {$kegiatan}\n";
        $template .= "*Tempat       :* {$tempat}";

        if ($wilayahInfo) {
            $template .= "\n               {$wilayahInfo}";
        }

        $template .= "\n\n━━━━━━━━━━━━━━━━━━━━\n\n";
        $template .= "*IDENTITAS SURAT*\n";
        $template .= "*No. Agenda   :* {$noAgenda}\n";
        $template .= "*No. Surat    :* {$noSurat}\n";
        $template .= "*Tanggal Surat:* {$tanggalSurat}\n";
        $template .= "*Asal Surat   :* {$asalSurat}\n";
        $template .= "*Perihal      :* {$perihal}\n";

        $template .= "\n━━━━━━━━━━━━━━━━━━━━\n\n";
        $template .= "*Kehadiran    :* {$kehadiran}\n";
        $template .= "*Status       :* {$statusDisposisi}";

        if ($keterangan) {
            $template .= "\n\n*Keterangan:*\n{$keterangan}";
        }

        $template .= "\n\n---\n";
        $template .= "_Dikirim dari Sistem E-Office Kab. Tasikmalaya_";

        return $template;
    }

    /**
     * Delete penjadwalan permanently.
     */
    public function destroy(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('delete', $penjadwalan);

        $this->service->delete($penjadwalan);

        return redirect()->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }
}
