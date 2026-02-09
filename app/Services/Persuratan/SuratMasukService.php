<?php

namespace App\Services\Persuratan;

use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use App\Services\FileService;
use App\Support\CacheHelper;
use Illuminate\Http\UploadedFile;
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
            $data['nomor_agenda'] = SuratMasuk::generateNomorAgenda();

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

            $suratMasuk->tujuans()->delete();
            $this->syncTujuan($suratMasuk, $tujuanList);

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
     */
    private function syncTujuan(SuratMasuk $suratMasuk, array $tujuanList): void
    {
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

            SuratMasukTujuan::create([
                'surat_masuk_id' => $suratMasuk->id,
                'tujuan_id' => $userData?->id ?? null,
                'tujuan' => $userData?->name ?? $tujuan,
            ]);
        }
    }
}
