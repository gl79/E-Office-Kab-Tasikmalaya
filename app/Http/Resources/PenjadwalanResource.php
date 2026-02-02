<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PenjadwalanResource extends JsonResource
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

            // Surat Masuk Info
            'surat_masuk' => $this->when($this->relationLoaded('suratMasuk'), function () {
                return [
                    'id' => $this->suratMasuk->id,
                    'nomor_agenda' => $this->suratMasuk->nomor_agenda,
                    'nomor_surat' => $this->suratMasuk->nomor_surat,
                    'tanggal_surat' => $this->suratMasuk->tanggal_surat?->format('Y-m-d'),
                    'tanggal_surat_formatted' => $this->suratMasuk->tanggal_surat_formatted,
                    'tanggal_diterima' => $this->suratMasuk->tanggal_diterima?->format('Y-m-d'),
                    'tanggal_diterima_formatted' => $this->suratMasuk->tanggal_diterima_formatted,
                    'asal_surat' => $this->suratMasuk->asal_surat,
                    'perihal' => $this->suratMasuk->perihal,
                    'sifat' => $this->suratMasuk->sifat,
                    'sifat_label' => $this->suratMasuk->sifat_label,
                    'file_path' => $this->suratMasuk->file_path,
                    'file_url' => $this->suratMasuk->file_path
                        ? Storage::url($this->suratMasuk->file_path)
                        : null,
                ];
            }),

            // Jadwal Info
            'nama_kegiatan' => $this->nama_kegiatan,
            'tanggal_agenda' => $this->tanggal_agenda?->format('Y-m-d'),
            'tanggal_agenda_formatted' => $this->tanggal_formatted,
            'tanggal_format_indonesia' => $this->tanggal_format_indonesia,
            'hari' => $this->hari,
            'waktu_mulai' => $this->waktu_mulai,
            'waktu_selesai' => $this->waktu_selesai,
            'sampai_selesai' => $this->sampai_selesai,
            'waktu_lengkap' => $this->waktu_lengkap,

            // Lokasi Info
            'lokasi_type' => $this->lokasi_type,
            'lokasi_type_label' => $this->lokasi_type_label,
            'kode_wilayah' => $this->kode_wilayah,
            'tempat' => $this->tempat,

            // Status Info
            'status' => $this->status,
            'status_label' => $this->status_label,
            'status_disposisi' => $this->status_disposisi,
            'status_disposisi_label' => $this->status_disposisi_label,
            'dihadiri_oleh' => $this->dihadiri_oleh,

            // Catatan
            'keterangan' => $this->keterangan,

            // Audit Trail
            'created_by' => $this->when($this->relationLoaded('creator'), function () {
                return $this->creator ? [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ] : null;
            }),
            'updated_by' => $this->when($this->relationLoaded('updater'), function () {
                return $this->updater ? [
                    'id' => $this->updater->id,
                    'name' => $this->updater->name,
                ] : null;
            }),
            'deleted_by' => $this->when($this->relationLoaded('deleter'), function () {
                return $this->deleter ? [
                    'id' => $this->deleter->id,
                    'name' => $this->deleter->name,
                ] : null;
            }),

            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
            'deleted_at_formatted' => $this->deleted_at?->format('d/m/Y H:i'),

            // Permission flag untuk frontend
            'can_edit_kehadiran' => Auth::check() && $this->created_by === Auth::id(),
        ];
    }
}
