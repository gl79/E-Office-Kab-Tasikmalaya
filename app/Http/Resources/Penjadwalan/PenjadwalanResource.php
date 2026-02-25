<?php

namespace App\Http\Resources\Penjadwalan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PenjadwalanResource extends JsonResource
{
    /**
     * @param mixed $resource
     */
    public function __construct($resource)
    {
        parent::__construct($resource);
    }

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
                $sm = $this->suratMasuk;
                return [
                    'id' => $sm->id,
                    'nomor_agenda' => $sm->nomor_agenda,
                    'nomor_surat' => $sm->nomor_surat,
                    'tanggal_surat' => $sm->tanggal_surat?->format('Y-m-d'),
                    'tanggal_surat_formatted' => $sm->tanggal_surat_formatted,
                    'tanggal_diterima' => $sm->tanggal_diterima?->format('Y-m-d'),
                    'tanggal_diterima_formatted' => $sm->tanggal_diterima_formatted,
                    'asal_surat' => $sm->asal_surat,
                    'perihal' => $sm->perihal,
                    'sifat' => $sm->sifat,
                    'sifat_label' => $sm->sifat_label,
                    'file_path' => $sm->file_path,
                    'file_url' => $sm->file_path
                        ? Storage::url($sm->file_path)
                        : null,
                    // Extended fields for full detail view
                    'isi_ringkas' => $sm->isi_ringkas,
                    'lampiran' => $sm->lampiran,
                    'tanggal_diteruskan' => $sm->tanggal_diteruskan?->format('Y-m-d'),
                    'catatan_tambahan' => $sm->catatan_tambahan,
                    'tujuans' => $sm->relationLoaded('tujuans')
                        ? $sm->tujuans->map(fn($t) => ['id' => $t->id, 'tujuan' => $t->tujuan])
                        : [],
                    'jenis_surat' => $sm->relationLoaded('jenisSurat') && $sm->jenisSurat
                        ? ['id' => $sm->jenisSurat->id, 'nama' => $sm->jenisSurat->nama]
                        : null,
                    'indeks_berkas' => $sm->relationLoaded('indeksBerkas') && $sm->indeksBerkas
                        ? ['kode' => $sm->indeksBerkas->kode, 'nama' => $sm->indeksBerkas->nama]
                        : null,
                    'kode_klasifikasi' => $sm->relationLoaded('kodeKlasifikasi') && $sm->kodeKlasifikasi
                        ? ['kode' => $sm->kodeKlasifikasi->kode, 'nama' => $sm->kodeKlasifikasi->nama]
                        : null,
                    'staff_pengolah' => $sm->relationLoaded('staffPengolah') && $sm->staffPengolah
                        ? ['name' => $sm->staffPengolah->name, 'nip' => $sm->staffPengolah->nip]
                        : null,
                    'created_by' => $sm->relationLoaded('createdBy') && $sm->createdBy
                        ? ['name' => $sm->createdBy->name]
                        : null,
                    'created_at' => $sm->created_at?->format('Y-m-d H:i:s'),
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
            'status_formal' => $this->status_formal,
            'status_formal_label' => $this->status_formal_label,
            'status_disposisi' => $this->status_disposisi,
            'status_disposisi_label' => $this->status_disposisi_label,
            'dihadiri_oleh' => $this->dihadiri_oleh,
            'dihadiri_oleh_user_id' => $this->dihadiri_oleh_user_id,

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
