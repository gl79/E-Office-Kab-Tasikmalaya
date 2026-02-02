<?php

namespace App\Http\Controllers\Jadwal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Jadwal\UpdateKehadiranRequest;
use App\Http\Resources\PenjadwalanResource;
use App\Models\Penjadwalan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JadwalTentatifController extends Controller
{
    /**
     * Display a listing of tentatif penjadwalan.
     * Tab: Menunggu Peninjauan & Sudah Ditinjau
     */
    public function index(Request $request)
    {
        // Penjadwalan yang menunggu peninjauan (status_disposisi = 'menunggu')
        $menungguPeninjauan = Penjadwalan::query()
            ->menungguPeninjauan()
            ->with(['suratMasuk', 'creator'])
            ->search($request->input('search'))
            ->latest('tanggal_agenda')
            ->get();

        // Penjadwalan yang sudah ditinjau (status_disposisi IN ['bupati', 'wakil_bupati', 'diwakilkan'])
        $sudahDitinjau = Penjadwalan::query()
            ->sudahDitinjau()
            ->with(['suratMasuk', 'creator'])
            ->search($request->input('search'))
            ->latest('tanggal_agenda')
            ->get();

        return Inertia::render('Penjadwalan/Tentatif/Index', [
            'menungguPeninjauan' => PenjadwalanResource::collection($menungguPeninjauan),
            'sudahDitinjau' => PenjadwalanResource::collection($sudahDitinjau),
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

        DB::beginTransaction();
        try {
            $data = $request->validated();

            $penjadwalan->update([
                'dihadiri_oleh' => $data['dihadiri_oleh'],
                'status_disposisi' => $data['status_disposisi'],
                'keterangan' => $data['keterangan'] ?? $penjadwalan->keterangan,
            ]);

            DB::commit();

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

        // Build wilayah info if dalam daerah
        $wilayahInfo = '';
        if ($penjadwalan->lokasi_type === Penjadwalan::LOKASI_DALAM_DAERAH && $penjadwalan->kode_wilayah) {
            $wilayahInfo = $this->getWilayahText($penjadwalan->kode_wilayah);
        }

        $kehadiran = $penjadwalan->dihadiri_oleh ?: 'Menunggu Konfirmasi';
        $statusDisposisi = $penjadwalan->status_disposisi_label;
        $keterangan = $penjadwalan->keterangan;

        $template = "📅 RENCANA KEGIATAN BUPATI\n\n";
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
     * Get wilayah text from kode_wilayah
     * Format: xx.xx.xx.xxxx (provinsi.kabupaten.kecamatan.desa)
     */
    private function getWilayahText(string $kodeWilayah): string
    {
        // Parse kode wilayah
        $parts = explode('.', $kodeWilayah);

        if (count($parts) < 4) {
            return '';
        }

        $provinsiKode = $parts[0];
        $kabupatenKode = $parts[1];
        $kecamatanKode = $parts[2];
        $desaKode = $parts[3];

        // Get names from database
        $provinsi = \App\Models\WilayahProvinsi::where('kode', $provinsiKode)->first();
        $kabupaten = \App\Models\WilayahKabupaten::where('provinsi_kode', $provinsiKode)
            ->where('kode', $kabupatenKode)->first();
        $kecamatan = \App\Models\WilayahKecamatan::where('provinsi_kode', $provinsiKode)
            ->where('kabupaten_kode', $kabupatenKode)
            ->where('kode', $kecamatanKode)->first();
        $desa = \App\Models\WilayahDesa::where('provinsi_kode', $provinsiKode)
            ->where('kabupaten_kode', $kabupatenKode)
            ->where('kecamatan_kode', $kecamatanKode)
            ->where('kode', $desaKode)->first();

        $names = [];
        if ($desa) $names[] = $desa->nama;
        if ($kecamatan) $names[] = 'Kec. ' . $kecamatan->nama;
        if ($kabupaten) $names[] = $kabupaten->nama;
        if ($provinsi) $names[] = $provinsi->nama;

        return implode(', ', $names);
    }

    /**
     * Delete penjadwalan (soft delete)
     */
    public function destroy(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);

        $penjadwalan->delete();

        return redirect()->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }
}
