<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Events\JadwalCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Jadwal\BupatiJadwalRequest;
use App\Models\JadwalHistory;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use App\Support\CacheHelper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BupatiJadwalController extends Controller
{
    private const TASIKMALAYA_PROVINSI_KODE = '32';
    private const TASIKMALAYA_KABUPATEN_KODE = '06';

    /**
     * Show scheduling form for Bupati or delegated finalizer.
     */
    public function form(Request $request, SuratMasuk $surat): Response
    {
        $surat->load(['tujuans', 'penjadwalan']);

        $user = $request->user();
        $canScheduleByBupati = Gate::forUser($user)->check('scheduleByBupati', $surat);
        $canFinalizeDelegated = Gate::forUser($user)->check('finalizeDelegatedJadwal', $surat);

        abort_unless($canScheduleByBupati || $canFinalizeDelegated, 403);

        $bupati = $this->resolveBupatiUser();
        $existing = $surat->penjadwalan?->load('dihadiriOlehUser');

        return Inertia::render('Penjadwalan/Bupati/Form', [
            'surat' => [
                'id' => $surat->id,
                'nomor_agenda' => $surat->nomor_agenda,
                'nomor_surat' => $surat->nomor_surat,
                'tanggal_surat' => $surat->tanggal_surat?->format('Y-m-d'),
                'tanggal_surat_formatted' => $surat->tanggal_surat_formatted,
                'asal_surat' => $surat->asal_surat,
                'perihal' => $surat->perihal,
                'isi_ringkas' => $surat->isi_ringkas,
                'tujuan_list' => $surat->tujuan_list,
            ],
            'existingJadwal' => $existing ? [
                'id' => $existing->id,
                'tanggal_agenda' => $existing->tanggal_agenda?->format('Y-m-d'),
                'waktu_mulai' => $this->trimTime($existing->waktu_mulai),
                'waktu_selesai' => $existing->waktu_selesai ? $this->trimTime($existing->waktu_selesai) : null,
                'sampai_selesai' => (bool) $existing->sampai_selesai,
                'lokasi_type' => $existing->lokasi_type,
                'kode_wilayah' => $existing->kode_wilayah,
                'tempat' => $existing->tempat,
                'keterangan' => $existing->keterangan,
                'dihadiri_oleh_user_id' => $existing->dihadiri_oleh_user_id,
            ] : null,
            'context' => [
                'can_schedule_by_bupati' => $canScheduleByBupati,
                'can_finalize_delegated' => $canFinalizeDelegated,
                'default_dihadiri_oleh_user_id' => $existing?->dihadiri_oleh_user_id
                    ?? $bupati?->id
                    ?? $user?->id,
            ],
            'users' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'bupati_jadwal_user_options',
                60,
                fn() => User::query()
                    ->select(['id', 'name', 'nip', 'jabatan', 'role'])
                    ->where('role', '!=', User::ROLE_SUPERADMIN)
                    ->orderByRaw("CASE
                        WHEN jabatan = 'Bupati' THEN 1
                        WHEN jabatan = 'Wakil Bupati' THEN 2
                        ELSE 3
                    END")
                    ->orderBy('name')
                    ->get()
            )),
            'provinsiOptions' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'bupati_jadwal_provinsi_options',
                60,
                fn() => WilayahProvinsi::query()
                    ->select(['kode', 'nama'])
                    ->orderBy('nama')
                    ->get()
            )),
            'kecamatanTasikmalayaOptions' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'bupati_jadwal_kecamatan_tasik',
                60,
                fn() => WilayahKecamatan::query()
                    ->select(['kode', 'nama'])
                    ->where('provinsi_kode', self::TASIKMALAYA_PROVINSI_KODE)
                    ->where('kabupaten_kode', self::TASIKMALAYA_KABUPATEN_KODE)
                    ->orderBy('nama')
                    ->get()
            )),
        ]);
    }

    /**
     * Initial scheduling by Bupati.
     */
    public function store(BupatiJadwalRequest $request, SuratMasuk $surat): RedirectResponse
    {
        $surat->load(['tujuans', 'penjadwalan']);
        $this->authorize('scheduleByBupati', $surat);

        if ($surat->penjadwalan) {
            return redirect()->back()->with('error', 'Surat ini sudah memiliki jadwal.');
        }

        return $this->saveSchedule(
            $request,
            $surat,
            null
        );
    }

    /**
     * Reschedule / finalize delegated schedule using the same record.
     */
    public function update(BupatiJadwalRequest $request, SuratMasuk $surat): RedirectResponse
    {
        $surat->load(['tujuans', 'penjadwalan']);
        $jadwal = $surat->penjadwalan;

        if (!$jadwal) {
            return redirect()->back()->with('error', 'Data jadwal tidak ditemukan untuk surat ini.');
        }

        $user = $request->user();
        $canScheduleByBupati = Gate::forUser($user)->check('scheduleByBupati', $surat);
        $canFinalizeDelegated = Gate::forUser($user)->check('finalizeDelegatedJadwal', $surat);

        abort_unless($canScheduleByBupati || $canFinalizeDelegated, 403);

        return $this->saveSchedule(
            $request,
            $surat,
            $jadwal
        );
    }

    private function saveSchedule(
        BupatiJadwalRequest $request,
        SuratMasuk $surat,
        ?Penjadwalan $existingJadwal
    ): RedirectResponse {
        $validated = $request->validated();
        $attendee = User::query()->findOrFail($validated['dihadiri_oleh_user_id']);
        $bupati = $this->resolveBupatiUser();
        $attendedByBupati = $bupati && (int) $attendee->id === (int) $bupati->id;

        $payload = [
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
            // Sesuai kebutuhan terbaru: semua jadwal baru/ubah tetap masuk Tentatif.
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => $this->resolveDisposisiStatus($attendee),
        ];

        $conflictCount = $this->detectConflictCount(
            (int) $attendee->id,
            $payload['tanggal_agenda'],
            $payload['waktu_mulai'],
            $payload['waktu_selesai'],
            $payload['sampai_selesai'],
            $existingJadwal?->id
        );
        $hasConflict = $conflictCount > 0;

        try {
            DB::transaction(function () use (
                $payload,
                $existingJadwal,
                $surat,
                $attendee,
                $attendedByBupati,
                $request
            ) {
                if (!$existingJadwal) {
                    $alreadyScheduled = Penjadwalan::query()
                        ->where('surat_masuk_id', $surat->id)
                        ->lockForUpdate()
                        ->exists();

                    if ($alreadyScheduled) {
                        throw new \RuntimeException('SURAT_ALREADY_SCHEDULED');
                    }
                }

                if ($existingJadwal) {
                    $oldData = $existingJadwal->only([
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

                    $existingJadwal->update($payload);

                    JadwalHistory::create([
                        'jadwal_id' => $existingJadwal->id,
                        'old_data' => $oldData,
                        'new_data' => $existingJadwal->fresh()->only([
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
                        ]),
                        'changed_by' => $request->user()?->id,
                    ]);

                    $saved = $existingJadwal->fresh();
                } else {
                    $saved = Penjadwalan::create($payload);
                }

                if (!$attendedByBupati) {
                    $this->ensureRecipientTujuan($surat, $attendee);
                }

                CacheHelper::flush(['penjadwalan', 'persuratan_list']);

                // Reuse one event for create and reschedule notifications.
                event(new JadwalCreated($saved->id, (int) $attendee->id, (int) $request->user()->id));
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'SURAT_ALREADY_SCHEDULED') {
                return redirect()->back()->with('error', 'Surat ini sudah memiliki jadwal aktif.');
            }

            throw $e;
        } catch (QueryException $e) {
            $sqlState = $e->errorInfo[0] ?? null;
            $isDuplicateSuratSchedule = str_contains(strtolower($e->getMessage()), 'penjadwalan_surat_masuk_unique');

            if ($sqlState === '23505' && $isDuplicateSuratSchedule) {
                return redirect()->back()->with('error', 'Surat ini sudah memiliki jadwal aktif.');
            }

            throw $e;
        }

        $successMessage = $existingJadwal
            ? 'Jadwal berhasil diperbarui.'
            : 'Jadwal berhasil disimpan.';

        $response = redirect()
            ->route('persuratan.surat-masuk.index')
            ->with('success', $successMessage)
            ->with('has_conflict', $hasConflict);

        if ($hasConflict) {
            $response->with(
                'warning',
                "Jadwal tersimpan dengan peringatan: ditemukan {$conflictCount} konflik waktu pada tanggal yang sama."
            );
        }

        return $response;
    }

    private function resolveBupatiUser(): ?User
    {
        return User::query()
            ->where('role', User::ROLE_PIMPINAN)
            ->where(function ($query) {
                $query->whereRaw('LOWER(jabatan) = ?', ['bupati'])
                    ->orWhereRaw('LOWER(name) = ?', ['bupati']);
            })
            ->first();
    }

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

    private function ensureRecipientTujuan(SuratMasuk $surat, User $attendee): void
    {
        $alreadyExists = $surat->tujuans()
            ->where('tujuan_id', $attendee->id)
            ->exists();

        if ($alreadyExists) {
            return;
        }

        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $attendee->id,
            'tujuan' => $attendee->name,
            'nomor_agenda' => SuratMasukTujuan::generateNomorAgendaForRecipient((string) $attendee->id),
        ]);
    }

    private function detectConflictCount(
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
            ->whereDate('tanggal_agenda', $tanggal)
            ->where('dihadiri_oleh_user_id', $attendeeUserId);

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

    private function normalizeTime(string $time): string
    {
        return strlen($time) === 5 ? "{$time}:00" : $time;
    }

    private function trimTime(string $time): string
    {
        return strlen($time) >= 5 ? substr($time, 0, 5) : $time;
    }
}
