<?php

namespace App\Listeners;

use App\Events\JadwalCreated;
use App\Models\Penjadwalan;
use App\Models\User;
use App\Notifications\JadwalCreatedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendJadwalCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Force queue on Redis as required.
     */
    public string $connection = 'redis';
    public string $queue = 'notifications';

    /**
     * Handle the event.
     */
    public function handle(JadwalCreated $event): void
    {
        $recipient = User::query()->find($event->recipientUserId);
        if (!$recipient) {
            return;
        }

        $jadwal = Penjadwalan::query()
            ->with('suratMasuk')
            ->find($event->jadwalId);

        if (!$jadwal) {
            return;
        }

        $recipient->notify(new JadwalCreatedNotification($jadwal, $event->actorUserId));
    }
}

