<?php

namespace App\Http\Resources\Cuti;

use App\Models\Cuti;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class CutiResource extends JsonResource
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

            // Pegawai Snapshot
            'pegawai' => [
                'id' => $this->user_id,
                'name' => $this->nama_pegawai,
                'nip' => $this->nip_pegawai,
                'jabatan' => $this->jabatan_pegawai,
            ],

            // Atasan Snapshot
            'atasan' => $this->atasan_id ? [
                'id' => $this->atasan_id,
                'name' => $this->nama_atasan,
                'nip' => $this->nip_atasan,
                'jabatan' => $this->jabatan_atasan,
            ] : null,

            // Detail Cuti
            'jenis_cuti' => $this->jenis_cuti,
            'alasan_cuti' => $this->alasan_cuti,
            'lama_cuti' => $this->lama_cuti,
            'tanggal_mulai' => $this->tanggal_mulai?->format('Y-m-d'),
            'tanggal_mulai_formatted' => $this->tanggal_mulai_formatted,
            'tanggal_selesai' => $this->tanggal_selesai?->format('Y-m-d'),
            'tanggal_selesai_formatted' => $this->tanggal_selesai_formatted,
            'tanggal_range_formatted' => $this->tanggal_range_formatted,
            'alamat_cuti' => $this->alamat_cuti,

            // Status
            'status' => $this->status,
            'status_label' => $this->status_label,

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
            'created_at_formatted' => $this->created_at?->translatedFormat('d M Y H:i'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
            'deleted_at_formatted' => $this->deleted_at?->translatedFormat('d M Y H:i'),

            // Permissions
            'can_update' => Auth::check() && Auth::user()->can('update', $this->resource),
            'can_cancel' => Auth::check() && Auth::user()->can('cancel', $this->resource),
            'can_approve' => Auth::check() && Auth::user()->can('approve', $this->resource),
            'can_reject' => Auth::check() && Auth::user()->can('reject', $this->resource),
            'is_pending' => $this->status === Cuti::STATUS_PENDING,
        ];
    }
}
