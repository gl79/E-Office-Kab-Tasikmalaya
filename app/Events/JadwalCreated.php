<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JadwalCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly string $jadwalId,
        public readonly int $recipientUserId,
        public readonly int $actorUserId
    ) {}
}

