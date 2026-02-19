<?php

namespace App\Services\Persuratan;

use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use App\Services\FileService;
use App\Support\CacheHelper;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SuratMasukService
{
    /**
     * Store a new surat masuk with tujuan records and optional file upload.
     */
    public function store(array $data): SuratMasuk
    {
        return DB::transaction(function () use ($data) {
            $data['nomor_agenda'] = SuratMasuk::generateNomorAgenda((string) Auth::id());

            if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
                $data['file_path'] = FileService::store($data['file'], 'surat-masuk');
            }

            $tujuanList = $data['tujuan'] ?? [];
            unset($data['tujuan'], $data['file']);

            $suratMasuk = SuratMasuk::create($data);

            $this->syncTujuan($suratMasuk, $tujuanList);

            CacheHelper::flush(['persuratan_list']);

            return $suratMasuk;
        });
    }

    /**
     * Update an existing surat masuk with tujuan sync and optional file replacement.
     */
    public function update(SuratMasuk $suratMasuk, array $data): SuratMasuk
    {
        return DB::transaction(function () use ($suratMasuk, $data) {
            if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
                if ($suratMasuk->file_path) {
                    Storage::disk('public')->delete($suratMasuk->file_path);
                }
                $data['file_path'] = FileService::store($data['file'], 'surat-masuk');
            }

            $tujuanList = $data['tujuan'] ?? [];
            unset($data['tujuan'], $data['file']);

            $suratMasuk->update($data);

            // Simpan nomor agenda lama per-tujuan untuk di-reuse
            $oldTujuanAgendas = $suratMasuk->tujuans()
                ->whereNotNull('tujuan_id')
                ->pluck('nomor_agenda', 'tujuan_id')
                ->toArray();

            // Simpan status penerimaan lama agar tidak reset saat update.
            $oldTujuanPenerimaan = $suratMasuk->tujuans()
                ->whereNotNull('tujuan_id')
                ->get(['tujuan_id', 'status_penerimaan', 'diterima_at'])
                ->keyBy('tujuan_id')
                ->map(fn($item) => [
                    'status_penerimaan' => $item->status_penerimaan,
                    'diterima_at' => $item->diterima_at,
                ])
                ->toArray();

            $suratMasuk->tujuans()->delete();
            $this->syncTujuan($suratMasuk, $tujuanList, $oldTujuanAgendas, $oldTujuanPenerimaan);

            CacheHelper::flush(['persuratan_list']);

            return $suratMasuk;
        });
    }

    /**
     * Soft-delete a surat masuk.
     */
    public function delete(SuratMasuk $suratMasuk): void
    {
        $suratMasuk->delete();
        CacheHelper::flush(['persuratan_archive', 'persuratan_list']);
    }

    /**
     * Create tujuan records for a surat masuk.
     * Setiap penerima mendapat nomor agenda masing-masing.
     *
     * @param array<int, string> $oldAgendas Nomor agenda lama per tujuan_id (untuk update/reuse)
     * @param array<int, array{status_penerimaan: string|null, diterima_at: \Illuminate\Support\Carbon|string|null}> $oldPenerimaan
     */
    private function syncTujuan(
        SuratMasuk $suratMasuk,
        array $tujuanList,
        array $oldAgendas = [],
        array $oldPenerimaan = []
    ): void {
        if (empty($tujuanList)) {
            return;
        }

        // Batch load all users to avoid N+1 queries
        $numericIds = array_filter($tujuanList, 'is_numeric');
        $users = !empty($numericIds)
            ? User::whereIn('id', $numericIds)->get()->keyBy('id')
            : collect();

        foreach ($tujuanList as $tujuan) {
            $userData = is_numeric($tujuan) ? $users->get($tujuan) : null;

            // Generate nomor agenda per-recipient (hanya untuk user internal)
            $nomorAgenda = null;
            if ($userData) {
                // Reuse nomor agenda lama jika ada (untuk update)
                $nomorAgenda = $oldAgendas[$userData->id] ?? SuratMasukTujuan::generateNomorAgendaForRecipient($userData->id);
            }

            $penerimaanState = $userData && isset($oldPenerimaan[$userData->id])
                ? [
                    'status_penerimaan' => $oldPenerimaan[$userData->id]['status_penerimaan']
                        ?? SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
                    'diterima_at' => $oldPenerimaan[$userData->id]['diterima_at'] ?? null,
                ]
                : SuratMasukTujuan::initialPenerimaanState($userData);

            SuratMasukTujuan::create([
                'surat_masuk_id' => $suratMasuk->id,
                'tujuan_id' => $userData?->id ?? null,
                'tujuan' => $userData?->name ?? $tujuan,
                'nomor_agenda' => $nomorAgenda,
                'status_penerimaan' => $penerimaanState['status_penerimaan'],
                'diterima_at' => $penerimaanState['diterima_at'],
            ]);
        }
    }
}
