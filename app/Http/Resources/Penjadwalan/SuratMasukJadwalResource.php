<?php

namespace App\Http\Resources\Penjadwalan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Resource for SuratMasuk in Penjadwalan context
 * Used when listing surat masuk for scheduling purposes
 */
class SuratMasukJadwalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nomor_agenda' => $this->nomor_agenda,
            'nomor_surat' => $this->nomor_surat,
            'tanggal_surat' => $this->tanggal_surat?->format('Y-m-d'),
            'tanggal_surat_formatted' => $this->tanggal_surat_formatted,
            'tanggal_diterima' => $this->tanggal_diterima?->format('Y-m-d'),
            'tanggal_diterima_formatted' => $this->tanggal_diterima_formatted,
            'asal_surat' => $this->asal_surat,
            'perihal' => $this->perihal,
            'sifat' => $this->sifat,
            'sifat_label' => $this->sifat_label,
            'file_path' => $this->file_path,
            'file_url' => $this->file_path ? Storage::url($this->file_path) : null,
            'tujuan_list' => $this->tujuan_list,

            // Include agenda if exists (for "sudah dijadwalkan" tab)
            'agenda' => $this->when($this->relationLoaded('penjadwalan') && $this->penjadwalan, function () {
                return [
                    'id' => $this->penjadwalan->id,
                    'nama_kegiatan' => $this->penjadwalan->nama_kegiatan,
                    'tanggal_agenda' => $this->penjadwalan->tanggal_agenda?->format('Y-m-d'),
                    'tanggal_agenda_formatted' => $this->penjadwalan->tanggal_formatted,
                    'waktu_lengkap' => $this->penjadwalan->waktu_lengkap,
                    'tempat' => $this->penjadwalan->tempat,
                    'status' => $this->penjadwalan->status,
                    'status_label' => $this->penjadwalan->status_label,
                    'status_disposisi' => $this->penjadwalan->status_disposisi,
                    'status_disposisi_label' => $this->penjadwalan->status_disposisi_label,
                ];
            }),
        ];
    }
}
