<?php

namespace App\Services\Persuratan;

use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use App\Services\FileService;
use App\Support\CacheHelper;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SuratKeluarService
{
    /**
     * Store a new surat keluar with optional file upload.
     */
    public function store(array $data): SuratKeluar
    {
        return DB::transaction(function () use ($data) {
            $currentUserId = (int) Auth::id();

            // Set default sifat_2 if not provided
            if (empty($data['sifat_2'])) {
                $data['sifat_2'] = SuratKeluar::SIFAT_2_BIASA;
            }

            // Enforce no_urut generation di backend agar tidak bisa ditimpa dari client.
            $nextNoUrut = SuratKeluar::generateNextNoUrut($currentUserId, $data['tanggal_surat'] ?? null);
            $data['no_urut'] = str_pad((string) $nextNoUrut, 4, '0', STR_PAD_LEFT);

            if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
                $data['file_path'] = FileService::store($data['file'], 'surat-keluar');
            }
            unset($data['file']);

            $suratKeluar = SuratKeluar::create($data);

            // Auto-create SuratMasuk for the recipient
            $this->createSuratMasukForRecipient($suratKeluar);

            CacheHelper::flush(['persuratan_list']);

            return $suratKeluar;
        });
    }

    /**
     * Update an existing surat keluar with optional file replacement.
     */
    public function update(SuratKeluar $suratKeluar, array $data): SuratKeluar
    {
        return DB::transaction(function () use ($suratKeluar, $data) {
            // no_urut tidak boleh diubah dari client pada mode edit.
            $data['no_urut'] = $suratKeluar->no_urut;

            // Set default sifat_2 if not provided
            if (empty($data['sifat_2'])) {
                $data['sifat_2'] = SuratKeluar::SIFAT_2_BIASA;
            }

            if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
                if ($suratKeluar->file_path) {
                    Storage::disk('public')->delete($suratKeluar->file_path);
                }
                $data['file_path'] = FileService::store($data['file'], 'surat-keluar');
            }
            unset($data['file']);

            $suratKeluar->update($data);

            CacheHelper::flush(['persuratan_list']);

            return $suratKeluar;
        });
    }

    /**
     * Soft-delete a surat keluar.
     */
    public function delete(SuratKeluar $suratKeluar): void
    {
        $suratKeluar->delete();
        CacheHelper::flush(['persuratan_list']);
    }

    /**
     * Create SuratMasuk for recipient when SuratKeluar is created.
     * Maps fields from SuratKeluar to SuratMasuk.
     */
    private function createSuratMasukForRecipient(SuratKeluar $suratKeluar): void
    {
        if (empty($suratKeluar->kepada)) {
            return;
        }

        // Try to find user by name
        $recipient = User::where('name', $suratKeluar->kepada)->first();

        // Generate nomor agenda per-recipient
        $nomorAgenda = $recipient
            ? SuratMasukTujuan::generateNomorAgendaForRecipient($recipient->id)
            : SuratMasuk::generateNomorAgenda($suratKeluar->created_by);

        // Get sender info
        $sender = $suratKeluar->createdBy;
        $asalSurat = $sender
            ? ($sender->jabatan ? "{$sender->name} - {$sender->jabatan}" : $sender->name)
            : 'Unknown';

        $penerimaanState = SuratMasukTujuan::initialPenerimaanState($recipient);
        $statusTindakLanjut = $penerimaanState['status_penerimaan'] === SuratMasukTujuan::STATUS_DITERIMA
            ? SuratMasuk::STATUS_TINDAK_LANJUT_DITERIMA
            : SuratMasuk::STATUS_TINDAK_LANJUT_MENUNGGU;

        // Create SuratMasuk
        $suratMasuk = SuratMasuk::create([
            'nomor_agenda' => $nomorAgenda,
            'tanggal_diterima' => now(),
            'tanggal_surat' => $suratKeluar->tanggal_surat,
            'asal_surat' => $asalSurat,
            'nomor_surat' => $suratKeluar->nomor_surat,
            'sifat' => $suratKeluar->sifat_1, // Map sifat_1 to sifat
            'lampiran' => $suratKeluar->lampiran,
            'perihal' => $suratKeluar->perihal,
            'isi_ringkas' => $suratKeluar->isi_ringkas,
            'indeks_berkas_id' => $suratKeluar->indeks_id,
            'kode_klasifikasi_id' => $suratKeluar->kode_klasifikasi_id,
            'file_path' => $suratKeluar->file_path, // Reference same file
            'catatan_tambahan' => $suratKeluar->catatan,
            'status_tindak_lanjut' => $statusTindakLanjut,
            'created_by' => $suratKeluar->created_by,
        ]);

        // Create tujuan record dengan nomor agenda per-recipient
        SuratMasukTujuan::create([
            'surat_masuk_id' => $suratMasuk->id,
            'tujuan_id' => $recipient?->id,
            'tujuan' => $suratKeluar->kepada,
            'nomor_agenda' => $nomorAgenda,
            'status_penerimaan' => $penerimaanState['status_penerimaan'],
            'diterima_at' => $penerimaanState['diterima_at'],
        ]);
    }
}
