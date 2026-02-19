<?php

namespace App\Notifications;

use App\Models\Penjadwalan;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class JadwalCreatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Penjadwalan $jadwal,
        private readonly int $actorUserId
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'jadwal_created',
            'jadwal_id' => $this->jadwal->id,
            'surat_masuk_id' => $this->jadwal->surat_masuk_id,
            'nomor_surat' => $this->jadwal->suratMasuk?->nomor_surat,
            'perihal' => $this->jadwal->suratMasuk?->perihal,
            'tanggal_agenda' => $this->jadwal->tanggal_agenda?->format('Y-m-d'),
            'waktu_mulai' => $this->jadwal->waktu_mulai,
            'waktu_selesai' => $this->jadwal->waktu_selesai,
            'sampai_selesai' => (bool) $this->jadwal->sampai_selesai,
            'tempat' => $this->jadwal->tempat,
            'status' => $this->jadwal->status,
            'status_disposisi' => $this->jadwal->status_disposisi,
            'actor_user_id' => $this->actorUserId,
            'message' => 'Anda ditunjuk untuk menghadiri jadwal surat.',
        ];
    }
}

