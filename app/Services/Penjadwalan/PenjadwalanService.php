<?php

declare(strict_types=1);

namespace App\Services\Penjadwalan;

use App\Events\JadwalCreated;
use App\Models\JadwalHistory;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use App\Support\CacheHelper;
use Illuminate\Support\Facades\DB;

final class PenjadwalanService
{
    /**
     * Create a new schedule for a surat masuk.
     *
     * @param SuratMasuk $surat Must have tujuans loaded
     * @param array $validated Validated request data
     * @param User $requestUser The authenticated user making the request
     * @return array{success: bool, message: string, has_conflict: bool, conflict_count: int}
     */
    public function createSchedule(SuratMasuk $surat, array $validated, User $requestUser): array
    {
        return $this->saveSchedule($surat, $validated, $requestUser, null);
    }

    /**
     * Update an existing schedule.
     *
     * @param SuratMasuk $surat Must have tujuans and penjadwalan loaded
     * @param array $validated Validated request data
     * @param User $requestUser The authenticated user making the request
     * @return array{success: bool, message: string, has_conflict: bool, conflict_count: int}
     */
    public function updateSchedule(SuratMasuk $surat, array $validated, User $requestUser): array
    {
        $existingJadwal = $surat->penjadwalan;

        if (!$existingJadwal) {
            return [
                'success' => false,
                'message' => 'Data jadwal tidak ditemukan untuk surat ini.',
                'has_conflict' => false,
                'conflict_count' => 0,
            ];
        }

        return $this->saveSchedule($surat, $validated, $requestUser, $existingJadwal);
    }

    /**
     * Update kehadiran/disposisi on a penjadwalan record.
     */
    public function updateKehadiran(Penjadwalan $penjadwalan, array $validated, User $requestUser): void
    {
        DB::transaction(function () use ($penjadwalan, $validated, $requestUser) {
            $oldData = $this->captureHistorySnapshot($penjadwalan);
            $selectedUser = null;

            if (!empty($validated['dihadiri_oleh'])) {
                $selectedUser = User::query()
                    ->select(['id', 'name'])
                    ->find((int) $validated['dihadiri_oleh']);
            }

            $customAttendance = trim((string) ($validated['dihadiri_oleh_custom'] ?? ''));
            $attendanceName = $selectedUser?->name ?: ($customAttendance !== '' ? $customAttendance : null);

            $penjadwalan->update([
                'dihadiri_oleh' => $attendanceName,
                'dihadiri_oleh_user_id' => $selectedUser?->id,
                'status_disposisi' => $validated['status_disposisi'],
                'keterangan' => $validated['keterangan'] ?? $penjadwalan->keterangan,
            ]);

            $this->recordHistory($penjadwalan, $oldData, $requestUser);
        });

        CacheHelper::flush(['penjadwalan']);
    }

    /**
     * Promote a tentatif jadwal to definitif.
     *
     * @return array{success: bool, message: string}
     */
    public function promoteToDefinitif(Penjadwalan $penjadwalan, User $requestUser): array
    {
        if ($penjadwalan->status_disposisi === Penjadwalan::DISPOSISI_MENUNGGU) {
            return [
                'success' => false,
                'message' => 'Jadwal masih menunggu peninjauan. Harap perbarui status disposisi terlebih dahulu.',
            ];
        }

        DB::transaction(function () use ($penjadwalan, $requestUser) {
            $oldData = $this->captureHistorySnapshot($penjadwalan);

            $penjadwalan->update([
                'status' => Penjadwalan::STATUS_DEFINITIF,
            ]);

            $this->recordHistory($penjadwalan, $oldData, $requestUser);
        });

        CacheHelper::flush(['penjadwalan']);

        return [
            'success' => true,
            'message' => 'Jadwal berhasil dijadikan definitif.',
        ];
    }

    /**
     * Delete a penjadwalan permanently.
     */
    public function delete(Penjadwalan $penjadwalan): void
    {
        $penjadwalan->delete();
        CacheHelper::flush(['penjadwalan']);
    }

    /**
     * Resolve the Bupati user from the database.
     */
    public function resolveBupatiUser(): ?User
    {
        return User::query()
            ->where('role', '=', User::ROLE_PIMPINAN, 'and')
            ->where(function ($query) {
                $query->whereRaw('LOWER(jabatan) = ?', ['bupati'])
                    ->orWhereRaw('LOWER(name) = ?', ['bupati']);
            })
            ->first();
    }

    /**
     * Detect time conflicts for a given attendee on a specific date.
     */
    public function detectConflictCount(
        int $attendeeUserId,
        string $tanggal,
        string $waktuMulai,
        ?string $waktuSelesai,
        bool $sampaiSelesai,
        ?string $ignoreJadwalId = null
    ): int {
        $newStart = $this->normalizeTime($waktuMulai);
        $newEnd = $sampaiSelesai
            ? '23:59:59'
            : $this->normalizeTime((string) $waktuSelesai);

        $query = Penjadwalan::query()
            ->whereDate('tanggal_agenda', '=', $tanggal, 'and')
            ->where('dihadiri_oleh_user_id', '=', $attendeeUserId, 'and');

        if ($ignoreJadwalId) {
            $query->where('id', '!=', $ignoreJadwalId);
        }

        return $query->get()->filter(function (Penjadwalan $jadwal) use ($newStart, $newEnd) {
            $existingStart = $this->normalizeTime((string) $jadwal->waktu_mulai);
            $existingEnd = $jadwal->sampai_selesai
                ? '23:59:59'
                : $this->normalizeTime((string) ($jadwal->waktu_selesai ?? '23:59:59'));

            return $newStart < $existingEnd && $newEnd > $existingStart;
        })->count();
    }

    /**
     * Capture a snapshot of penjadwalan data for history recording.
     */
    public function captureHistorySnapshot(Penjadwalan $penjadwalan): array
    {
        return $penjadwalan->only([
            'surat_masuk_id',
            'tanggal_agenda',
            'waktu_mulai',
            'waktu_selesai',
            'sampai_selesai',
            'lokasi_type',
            'kode_wilayah',
            'tempat',
            'status',
            'status_disposisi',
            'dihadiri_oleh',
            'dihadiri_oleh_user_id',
            'keterangan',
        ]);
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Core save logic for both create and update schedule operations.
     *
     * @return array{success: bool, message: string, has_conflict: bool, conflict_count: int}
     */
    private function saveSchedule(
        SuratMasuk $surat,
        array $validated,
        User $requestUser,
        ?Penjadwalan $existingJadwal
    ): array {
        $attendee = User::query()->findOrFail($validated['dihadiri_oleh_user_id']);
        $bupati = $this->resolveBupatiUser();
        $attendedByBupati = $bupati && (int) $attendee->id === (int) $bupati->id;

        $payload = $this->buildPayload($surat, $validated, $attendee);

        $conflictCount = $this->detectConflictCount(
            (int) $attendee->id,
            $payload['tanggal_agenda'],
            $payload['waktu_mulai'],
            $payload['waktu_selesai'],
            $payload['sampai_selesai'],
            $existingJadwal?->id
        );

        try {
            DB::transaction(function () use (
                $payload,
                $existingJadwal,
                $surat,
                $attendee,
                $attendedByBupati,
                $requestUser
            ) {
                if (!$existingJadwal) {
                    $alreadyScheduled = Penjadwalan::query()
                        ->where('surat_masuk_id', '=', $surat->id, 'and')
                        ->lockForUpdate()
                        ->exists();

                    if ($alreadyScheduled) {
                        throw new \RuntimeException('SURAT_ALREADY_SCHEDULED');
                    }
                }

                if ($existingJadwal) {
                    $oldData = $this->captureHistorySnapshot($existingJadwal);
                    $existingJadwal->update($payload);
                    $this->recordHistory($existingJadwal, $oldData, $requestUser);
                    $saved = $existingJadwal->fresh();
                } else {
                    $saved = Penjadwalan::create($payload);
                }

                if (!$attendedByBupati) {
                    $this->ensureRecipientTujuan($surat, $attendee);
                }

                CacheHelper::flush(['penjadwalan', 'persuratan_list']);

                event(new JadwalCreated($saved->id, (int) $attendee->id, (int) $requestUser->id));
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'SURAT_ALREADY_SCHEDULED') {
                return [
                    'success' => false,
                    'message' => 'Surat ini sudah memiliki jadwal aktif.',
                    'has_conflict' => false,
                    'conflict_count' => 0,
                ];
            }
            throw $e;
        } catch (\Illuminate\Database\QueryException $e) {
            $sqlState = $e->errorInfo[0] ?? null;
            $isDuplicateSuratSchedule = str_contains(strtolower($e->getMessage()), 'penjadwalan_surat_masuk_unique');

            if ($sqlState === '23505' && $isDuplicateSuratSchedule) {
                return [
                    'success' => false,
                    'message' => 'Surat ini sudah memiliki jadwal aktif.',
                    'has_conflict' => false,
                    'conflict_count' => 0,
                ];
            }
            throw $e;
        }

        return [
            'success' => true,
            'message' => $existingJadwal
                ? 'Jadwal berhasil diperbarui.'
                : 'Jadwal berhasil disimpan.',
            'has_conflict' => $conflictCount > 0,
            'conflict_count' => $conflictCount,
        ];
    }

    /**
     * Build the schedule payload from validated data.
     */
    private function buildPayload(SuratMasuk $surat, array $validated, User $attendee): array
    {
        return [
            'surat_masuk_id' => $surat->id,
            'nama_kegiatan' => $surat->perihal,
            'tanggal_agenda' => $validated['tanggal_agenda'],
            'waktu_mulai' => $validated['waktu_mulai'],
            'waktu_selesai' => $validated['waktu_selesai'] ?? null,
            'sampai_selesai' => (bool) ($validated['sampai_selesai'] ?? false),
            'lokasi_type' => $validated['lokasi_type'],
            'kode_wilayah' => $this->buildKodeWilayah($validated),
            'tempat' => $validated['tempat'],
            'keterangan' => $validated['keterangan'] ?? null,
            'dihadiri_oleh' => $attendee->name,
            'dihadiri_oleh_user_id' => $attendee->id,
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => $this->resolveDisposisiStatus($attendee),
        ];
    }

    /**
     * Resolve the disposisi status based on the attendee.
     */
    private function resolveDisposisiStatus(User $attendee): string
    {
        if ($attendee->isBupati()) {
            return Penjadwalan::DISPOSISI_BUPATI;
        }

        if ($attendee->isWakilBupati()) {
            return Penjadwalan::DISPOSISI_WAKIL_BUPATI;
        }

        return Penjadwalan::DISPOSISI_DIWAKILKAN;
    }

    private const TASIKMALAYA_PROVINSI_KODE = '32';
    private const TASIKMALAYA_KABUPATEN_KODE = '06';

    /**
     * Build kode wilayah from validated data.
     */
    private function buildKodeWilayah(array $validated): ?string
    {
        if ($validated['lokasi_type'] !== Penjadwalan::LOKASI_DALAM_DAERAH) {
            return null;
        }

        return implode('.', [
            self::TASIKMALAYA_PROVINSI_KODE,
            self::TASIKMALAYA_KABUPATEN_KODE,
            $validated['kecamatan_id'],
            $validated['desa_id'],
        ]);
    }

    /**
     * Ensure the attendee has a tujuan record for the surat.
     */
    private function ensureRecipientTujuan(SuratMasuk $surat, User $attendee): void
    {
        $alreadyExists = $surat->tujuans()
            ->where('tujuan_id', '=', $attendee->id, 'and')
            ->exists();

        if ($alreadyExists) {
            return;
        }

        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $attendee->id,
            'tujuan' => $attendee->name,
            'nomor_agenda' => SuratMasukTujuan::generateNomorAgendaForRecipient((string) $attendee->id),
            ...SuratMasukTujuan::initialPenerimaanState($attendee),
        ]);
    }

    /**
     * Record a history entry for a penjadwalan change.
     */
    private function recordHistory(Penjadwalan $penjadwalan, array $oldData, User $changedBy): void
    {
        JadwalHistory::create([
            'jadwal_id' => $penjadwalan->id,
            'old_data' => $oldData,
            'new_data' => $this->captureHistorySnapshot($penjadwalan->fresh()),
            'changed_by' => $changedBy->id,
        ]);
    }

    /**
     * Normalize time string to H:i:s format.
     */
    private function normalizeTime(string $time): string
    {
        return strlen($time) === 5 ? "{$time}:00" : $time;
    }
}
