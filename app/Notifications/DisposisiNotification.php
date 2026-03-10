<?php

namespace App\Notifications;

use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DisposisiNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private SuratMasuk $suratMasuk,
        private User $dariUser,
        private ?string $catatan
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'disposisi',
            'title' => 'Disposisi Baru',
            'message' => 'Anda menerima disposisi surat dari ' . $this->dariUser->name . ' (' . ($this->dariUser->jabatan_nama ?? '-') . ').' . ($this->catatan ? ' Catatan: "' . $this->catatan . '"' : ''),
            'surat_masuk_id' => $this->suratMasuk->id,
            'url' => route('persuratan.surat-masuk.index'),
        ];
    }
}
