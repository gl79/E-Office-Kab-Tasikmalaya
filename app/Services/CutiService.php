<?php

namespace App\Services;

use App\Models\Cuti;
use App\Models\User;

class CutiService
{
    /**
     * Create new cuti with pegawai & atasan snapshots.
     *
     * @param array<string, mixed> $data
     */
    public static function create(array $data, User $pegawai, ?User $atasan): Cuti
    {
        $payload = array_merge($data, self::buildSnapshot($pegawai, $atasan));
        $payload['status'] = Cuti::STATUS_PENDING;

        return Cuti::create($payload);
    }

    /**
     * Update cuti (only allowed while pending).
     *
     * @param array<string, mixed> $data
     */
    public static function update(Cuti $cuti, array $data, User $pegawai, ?User $atasan): Cuti
    {
        self::ensurePending($cuti, 'diperbarui');

        $payload = array_merge($data, self::buildSnapshot($pegawai, $atasan));

        $cuti->update($payload);

        return $cuti;
    }

    /**
     * Cancel cuti (only allowed while pending).
     */
    public static function cancel(Cuti $cuti): Cuti
    {
        self::ensurePending($cuti, 'dibatalkan');

        $cuti->update([
            'status' => Cuti::STATUS_CANCELLED,
        ]);

        return $cuti;
    }

    /**
     * Approve cuti (only allowed while pending).
     */
    public static function approve(Cuti $cuti): Cuti
    {
        self::ensurePending($cuti, 'disetujui');

        $cuti->update([
            'status' => Cuti::STATUS_APPROVED,
        ]);

        return $cuti;
    }

    /**
     * Reject cuti (only allowed while pending).
     */
    public static function reject(Cuti $cuti): Cuti
    {
        self::ensurePending($cuti, 'ditolak');

        $cuti->update([
            'status' => Cuti::STATUS_REJECTED,
        ]);

        return $cuti;
    }

    /**
     * @return array<string, mixed>
     */
    private static function buildSnapshot(User $pegawai, ?User $atasan): array
    {
        return [
            'user_id' => $pegawai->id,
            'nama_pegawai' => $pegawai->name,
            'nip_pegawai' => $pegawai->nip,
            'jabatan_pegawai' => $pegawai->jabatan,
            'atasan_id' => $atasan?->id,
            'nama_atasan' => $atasan?->name,
            'nip_atasan' => $atasan?->nip,
            'jabatan_atasan' => $atasan?->jabatan,
        ];
    }

    private static function ensurePending(Cuti $cuti, string $actionLabel): void
    {
        if ($cuti->status !== Cuti::STATUS_PENDING) {
            throw new \RuntimeException("Pengajuan cuti tidak bisa {$actionLabel} karena status sudah {$cuti->status_label}.");
        }
    }
}
