<?php

declare(strict_types=1);

namespace App\Services\Penjadwalan;

use App\Events\JadwalCreated;
use App\Models\JadwalHistory;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\TimelineSurat;
use App\Models\User;
use App\Services\Persuratan\SuratMasukService;
use App\Support\CacheHelper;
use Illuminate\Support\Facades\DB;

final class PenjadwalanService
{
    public function __construct(
        private readonly SuratMasukService $suratMasukService,
    ) {}

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
     * Buat jadwal custom (tanpa surat masuk), langsung berstatus definitif.
     *
     * @param array $validated Data dari CustomJadwalRequest
     * @param User $requestUser User yang membuat jadwal
     * @return array{success: bool, message: string, has_conflict: bool, conflict_count: int}
     */
    public function createCustomSchedule(array $validated, User $requestUser): array
    {
        return DB::transaction(function () use ($validated, $requestUser) {
            $filePath = null;
            if (isset($validated['file']) && $validated['file'] instanceof \Illuminate\Http\UploadedFile) {
                $filePath = $validated['file']->store('penjadwalans', 'public');
            }

            $payload = [
                'surat_masuk_id' => null,
                'nama_kegiatan' => $validated['nama_kegiatan'],
                'tanggal_agenda' => $validated['tanggal_agenda'],
                'waktu_mulai' => $validated['waktu_mulai'],
                'waktu_selesai' => $validated['waktu_selesai'] ?? null,
                'sampai_selesai' => (bool) ($validated['sampai_selesai'] ?? false),
                'lokasi_type' => $validated['lokasi_type'],
                'kode_wilayah' => $this->buildKodeWilayah($validated),
                'tempat' => $validated['tempat'],
                'keterangan' => $validated['keterangan'] ?? null,
                'dihadiri_oleh' => $requestUser->name,
                'dihadiri_oleh_user_id' => $requestUser->id,
                'status_kehadiran' => $validated['status_kehadiran'] ?? null,
                'nama_yang_mewakili' => $validated['nama_yang_mewakili'] ?? null,
                'status' => Penjadwalan::STATUS_DEFINITIF,
                'status_disposisi' => $this->resolveDisposisiStatus($requestUser),
                'sumber_jadwal' => Penjadwalan::SUMBER_SELF,
                'file_path' => $filePath,
                'created_by' => $requestUser->id,
                'updated_by' => $requestUser->id,
            ];

            // Deteksi konflik jadwal pada tanggal yang sama
            $conflictCount = $this->detectConflictCount(
                $requestUser->id,
                $validated['tanggal_agenda'],
                $validated['waktu_mulai'],
                $validated['waktu_selesai'] ?? null,
                (bool) ($validated['sampai_selesai'] ?? false),
            );

            $penjadwalan = Penjadwalan::create($payload);

            event(new JadwalCreated($penjadwalan->id, $requestUser->id, $requestUser->id));

            CacheHelper::flush(['penjadwalan']);

            return [
                'success' => true,
                'message' => 'Jadwal custom berhasil dibuat dan langsung definitif.',
                'has_conflict' => $conflictCount > 0,
                'conflict_count' => $conflictCount,
            ];
        });
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

        // Preserve sumber_jadwal from existing record unless explicitly changing
        return $this->saveSchedule($surat, $validated, $requestUser, $existingJadwal);
    }

    /**
     * Menindaklanjuti jadwal tentatif menjadi jadwal definitif beserta data kehadiran dan lokasinya.
     */
    public function tindakLanjut(Penjadwalan $penjadwalan, array $validated, User $requestUser): void
    {
        DB::transaction(function () use ($penjadwalan, $validated, $requestUser) {
            $oldData = $this->captureHistorySnapshot($penjadwalan);

            // Determine attendance based on status_kehadiran enum
            $attendanceName = null;
            $attendanceUserId = null;

            if ($validated['status_kehadiran'] === 'Dihadiri') {
                $attendanceName = $requestUser->name;
                $attendanceUserId = $requestUser->id;
            } elseif ($validated['status_kehadiran'] === 'Diwakilkan' && !empty($validated['keterangan'])) {
                // Simplification for mewakili: just store the text description if it's not a direct system user
                // Ideally this would link to another user, but per current form, we just rely on string if they type it in Keterangan
                $attendanceName = 'Diwakilkan';
            }

            // Format nama_yang_mewakili to include jabatan if available
            $namaMewakili = null;
            if ($validated['status_kehadiran'] === 'Diwakilkan') {
                $namaRaw = $validated['nama_yang_mewakili'] ?? '';
                $jabatanRaw = $validated['jabatan_yang_mewakili'] ?? '';
                $namaMewakili = trim($namaRaw . ($jabatanRaw ? " ({$jabatanRaw})" : ''));
            }

            $statusKehadiran = (string) $validated['status_kehadiran'];

            // Move to Definitive
            $payload = [
                'tanggal_agenda' => $validated['tanggal_agenda'],
                'waktu_mulai' => $validated['waktu_mulai'],
                'waktu_selesai' => $validated['sampai_selesai'] ? null : ($validated['waktu_selesai'] ?? null),
                'sampai_selesai' => (bool) ($validated['sampai_selesai'] ?? false),
                'lokasi_type' => $validated['lokasi_type'],
                'kode_wilayah' => $this->buildKodeWilayah($validated),
                'tempat' => $validated['tempat'],
                'status_kehadiran' => $statusKehadiran,
                'nama_yang_mewakili' => $namaMewakili,
                'keterangan' => $validated['keterangan'] ?? $penjadwalan->keterangan,
                'dihadiri_oleh' => $attendanceName,
                'dihadiri_oleh_user_id' => $attendanceUserId,
                'status_disposisi' => $this->resolveDisposisiStatusFromAttendance(
                    $requestUser,
                    $statusKehadiran
                ),
                'status' => Penjadwalan::STATUS_DEFINITIF,
                'updated_by' => $requestUser->id,
            ];

            $penjadwalan->update($payload);

            $this->recordHistory($penjadwalan, $oldData, $requestUser);

            if ($penjadwalan->surat_masuk_id) {
                $this->syncSuratWorkflowStatus($penjadwalan->surat_masuk_id);

                $statusSummary = match ($statusKehadiran) {
                    'Dihadiri' => 'Kegiatan dihadiri langsung.',
                    'Diwakilkan' => 'Kegiatan diwakilkan kepada ' . ($namaMewakili ?: 'pejabat yang ditunjuk') . '.',
                    default => "Status kehadiran: {$statusKehadiran}.",
                };

                TimelineSurat::record(
                    $penjadwalan->surat_masuk_id,
                    $requestUser->id,
                    TimelineSurat::AKSI_DEFINITIF,
                    "Jadwal ditindaklanjuti oleh {$requestUser->name} dan menjadi Jadwal Definitif. {$statusSummary}"
                );
            }
        });

        CacheHelper::flush(['penjadwalan', 'persuratan_list', 'dashboard_metrics']);
    }


    /**
     * Delete a penjadwalan permanently.
     * 
     * @param Penjadwalan $penjadwalan
     * @return void
     */
    public function delete(Penjadwalan $penjadwalan): void
    {
        /** @var \Illuminate\Database\Eloquent\Model $penjadwalan */
        DB::transaction(function () use ($penjadwalan) {
            $suratMasukId = $penjadwalan->surat_masuk_id;

            $penjadwalan->delete();

            if ($suratMasukId) {
                $suratMasuk = SuratMasuk::find($suratMasukId);
                if ($suratMasuk) {
                    $this->syncSuratWorkflowStatus($suratMasukId);

                    TimelineSurat::record(
                        $suratMasukId,
                        \Illuminate\Support\Facades\Auth::id(),
                        TimelineSurat::AKSI_JADWALKAN,
                        'Jadwal dihapus dari sistem.'
                    );
                }
            }
        });

        CacheHelper::flush(['penjadwalan', 'persuratan_list']);
    }

    /**
     * Revert jadwal definitif (berbasis surat) kembali ke status tentatif.
     */
    public function revertDefinitifToTentatif(Penjadwalan $penjadwalan, User $requestUser): void
    {
        DB::transaction(function () use ($penjadwalan, $requestUser) {
            $oldData = $this->captureHistorySnapshot($penjadwalan);

            $restorePayload = $this->buildTentatifRestorePayload($penjadwalan);
            $restorePayload['updated_by'] = $requestUser->id;

            $penjadwalan->update($restorePayload);

            $this->recordHistory($penjadwalan, $oldData, $requestUser);

            if ($penjadwalan->surat_masuk_id) {
                $this->syncSuratWorkflowStatus($penjadwalan->surat_masuk_id);

                TimelineSurat::record(
                    $penjadwalan->surat_masuk_id,
                    $requestUser->id,
                    TimelineSurat::AKSI_JADWALKAN,
                    'Jadwal definitif dihapus dan dikembalikan ke Jadwal Tentatif.'
                );
            }
        });

        CacheHelper::flush(['penjadwalan', 'persuratan_list', 'dashboard_metrics']);
    }

    /**
     * Resolve the Bupati user from the database.
     */
    public function resolveBupatiUser(): ?User
    {
        return User::query()
            ->where('role', '=', User::ROLE_PEJABAT)
            ->whereHas('jabatanRelasi', fn($q) => $q->where('level', '=', 1))
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
            ->whereDate('tanggal_agenda', '=', $tanggal)
            ->where('dihadiri_oleh_user_id', '=', $attendeeUserId);

        if ($ignoreJadwalId) {
            $query->where('id', '<>', $ignoreJadwalId);
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
            'sumber_jadwal',
            'dihadiri_oleh',
            'dihadiri_oleh_user_id',
            'status_kehadiran',
            'nama_yang_mewakili',
            'keterangan',
        ]);
    }

    /**
     * Build payload untuk mengembalikan jadwal ke snapshot tentatif terakhir.
     */
    private function buildTentatifRestorePayload(Penjadwalan $penjadwalan): array
    {
        $latestDefinitifHistory = $penjadwalan->histories()
            ->where('new_data->status', '=', Penjadwalan::STATUS_DEFINITIF)
            ->latest('created_at')
            ->first();

        $snapshot = is_array($latestDefinitifHistory?->old_data)
            ? $latestDefinitifHistory->old_data
            : null;

        if (is_array($snapshot) && (($snapshot['status'] ?? null) === Penjadwalan::STATUS_TENTATIF)) {
            return [
                'tanggal_agenda' => $snapshot['tanggal_agenda'] ?? $penjadwalan->tanggal_agenda?->format('Y-m-d'),
                'waktu_mulai' => $snapshot['waktu_mulai'] ?? $penjadwalan->waktu_mulai,
                'waktu_selesai' => $snapshot['waktu_selesai'] ?? $penjadwalan->waktu_selesai,
                'sampai_selesai' => (bool) ($snapshot['sampai_selesai'] ?? $penjadwalan->sampai_selesai),
                'lokasi_type' => $snapshot['lokasi_type'] ?? $penjadwalan->lokasi_type,
                'kode_wilayah' => $snapshot['kode_wilayah'] ?? $penjadwalan->kode_wilayah,
                'tempat' => $snapshot['tempat'] ?? $penjadwalan->tempat,
                'status' => Penjadwalan::STATUS_TENTATIF,
                'status_disposisi' => $snapshot['status_disposisi'] ?? $penjadwalan->status_disposisi,
                'sumber_jadwal' => $snapshot['sumber_jadwal'] ?? $penjadwalan->sumber_jadwal,
                'dihadiri_oleh' => $snapshot['dihadiri_oleh'] ?? $penjadwalan->dihadiri_oleh,
                'dihadiri_oleh_user_id' => $snapshot['dihadiri_oleh_user_id'] ?? $penjadwalan->dihadiri_oleh_user_id,
                'status_kehadiran' => $snapshot['status_kehadiran'] ?? null,
                'nama_yang_mewakili' => $snapshot['nama_yang_mewakili'] ?? null,
                'keterangan' => $snapshot['keterangan'] ?? $penjadwalan->keterangan,
            ];
        }

        return [
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_kehadiran' => null,
            'nama_yang_mewakili' => null,
        ];
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
                        ->where('surat_masuk_id', '=', $surat->id)
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

                $this->syncSuratWorkflowStatus($surat->id);

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
            'status_kehadiran' => $validated['status_kehadiran'] ?? null,
            'nama_yang_mewakili' => $validated['nama_yang_mewakili'] ?? null,
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => $this->resolveDisposisiStatus($attendee),
            'sumber_jadwal' => $validated['sumber_jadwal'] ?? Penjadwalan::SUMBER_DISPOSISI,
        ];
    }

    /**
     * Resolve the disposisi status based on the attendee.
     */
    private function resolveDisposisiStatus(User $attendee): string
    {
        $level = $attendee->getJabatanLevel();

        if ($level === 1) {
            return Penjadwalan::DISPOSISI_BUPATI;
        }

        if ($level === 2) {
            return Penjadwalan::DISPOSISI_WAKIL_BUPATI;
        }

        return Penjadwalan::DISPOSISI_DIWAKILKAN;
    }

    /**
     * Resolve status_disposisi ketika jadwal ditindaklanjuti.
     */
    private function resolveDisposisiStatusFromAttendance(User $requestUser, string $statusKehadiran): string
    {
        if ($statusKehadiran === 'Diwakilkan') {
            return Penjadwalan::DISPOSISI_DIWAKILKAN;
        }

        return $this->resolveDisposisiStatus($requestUser);
    }

    private const TASIKMALAYA_PROVINSI_KODE = '32';
    private const TASIKMALAYA_KABUPATEN_KODE = '06';

    /**
     * Build kode wilayah from validated data.
     */
    private function buildKodeWilayah(array $validated): ?string
    {
        if ($validated['lokasi_type'] === Penjadwalan::LOKASI_DALAM_DAERAH) {
            if (empty($validated['kecamatan_id']) && empty($validated['desa_id'])) {
                return null;
            }
            return implode('.', [
                self::TASIKMALAYA_PROVINSI_KODE,
                self::TASIKMALAYA_KABUPATEN_KODE,
                $validated['kecamatan_id'] ?? '',
                $validated['desa_id'] ?? '',
            ]);
        }

        if (empty($validated['provinsi_id']) && empty($validated['kabupaten_id'])) {
            return null;
        }

        return implode('.', [
            $validated['provinsi_id'] ?? '',
            $validated['kabupaten_id'] ?? '',
        ]);
    }

    /**
     * Sinkronkan status tindak lanjut surat induk berdasarkan kondisi jadwal terbaru.
     */
    private function syncSuratWorkflowStatus(?string $suratMasukId): void
    {
        if (!$suratMasukId) {
            return;
        }

        $suratMasuk = SuratMasuk::query()->find($suratMasukId);
        if (!$suratMasuk) {
            return;
        }

        $this->suratMasukService->syncGlobalWorkflowStatus($suratMasuk);
    }

    /**
     * Ensure the attendee has a tujuan record for the surat.
     */
    private function ensureRecipientTujuan(SuratMasuk $surat, User $attendee): void
    {
        /** @var SuratMasukTujuan|null $existingKeTujuan */
        $existingKeTujuan = $surat->tujuans()
            ->where('tujuan_id', '=', $attendee->id)
            ->first();

        if ($existingKeTujuan) {
            $existingKeTujuan->update([
                'is_primary' => true,
                'is_tembusan' => false,
                'status_penerimaan' => SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
                'diterima_at' => null,
            ]);
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
