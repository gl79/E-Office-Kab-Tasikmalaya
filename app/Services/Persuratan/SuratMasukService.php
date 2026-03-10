<?php

namespace App\Services\Persuratan;

use App\Models\DisposisiSurat;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\TimelineSurat;
use App\Models\User;
use App\Services\FileService;
use App\Support\CacheHelper;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class SuratMasukService
{
    /**
     * Get the surat masuk list for a specific user, with permission flags resolved.
     *
     * @param User $user The authenticated user
     * @return Collection<int, SuratMasuk>
     */
    public function getListForUser(User $user): Collection
    {
        $query = SuratMasuk::query()
            ->with(['tujuans.user', 'indeksBerkas', 'kodeKlasifikasi', 'staffPengolah.jabatanRelasi', 'createdBy', 'jenisSurat', 'penjadwalan'])
            ->latest();

        $this->applyVisibilityScope($query, $user);

        return $query->get()->map(fn(SuratMasuk $surat) => $this->enrichWithPermissions($surat, $user));
    }

    /**
     * Store a new surat masuk with tujuan records and optional file upload.
     */
    public function store(array $data): SuratMasuk
    {
        return DB::transaction(function () use ($data) {
            $data['nomor_agenda'] = SuratMasuk::generateNomorAgenda((string) Auth::id());

            if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
                $data['file_path'] = FileService::store($data['file'], 'surat-masuk');
            }

            $tujuanList = $data['tujuan'] ?? [];
            unset($data['tujuan'], $data['file']);

            $suratMasuk = SuratMasuk::create($data);

            $this->syncTujuan($suratMasuk, $tujuanList);

            // Catat timeline: surat diinput
            TimelineSurat::record(
                $suratMasuk->id,
                Auth::id(),
                TimelineSurat::AKSI_INPUT,
                'Surat diinput oleh Tata Usaha'
            );

            // Catat timeline: surat dikirim ke penerima
            $tujuanNames = $suratMasuk->fresh()?->tujuans->pluck('tujuan')->join(', ');
            if ($tujuanNames) {
                TimelineSurat::record(
                    $suratMasuk->id,
                    Auth::id(),
                    TimelineSurat::AKSI_KIRIM,
                    "Surat dikirim ke {$tujuanNames}"
                );
            }

            CacheHelper::flush(['persuratan_list']);

            return $suratMasuk;
        });
    }

    /**
     * Update an existing surat masuk with tujuan sync and optional file replacement.
     */
    public function update(SuratMasuk $suratMasuk, array $data): SuratMasuk
    {
        return DB::transaction(function () use ($suratMasuk, $data) {
            if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
                if ($suratMasuk->file_path) {
                    Storage::disk('public')->delete($suratMasuk->file_path);
                }
                $data['file_path'] = FileService::store($data['file'], 'surat-masuk');
            }

            $tujuanList = $data['tujuan'] ?? [];
            unset($data['tujuan'], $data['file']);

            $suratMasuk->update($data);

            // Simpan nomor agenda lama per-tujuan untuk di-reuse
            $oldTujuanAgendas = $suratMasuk->tujuans()
                ->whereNotNull('tujuan_id')
                ->pluck('nomor_agenda', 'tujuan_id')
                ->toArray();

            // Simpan status penerimaan lama agar tidak reset saat update.
            $oldTujuanPenerimaan = $suratMasuk->tujuans()
                ->whereNotNull('tujuan_id')
                ->get(['tujuan_id', 'status_penerimaan', 'diterima_at'])
                ->keyBy('tujuan_id')
                ->map(fn($item) => [
                    'status_penerimaan' => $item->status_penerimaan,
                    'diterima_at' => $item->diterima_at,
                ])
                ->toArray();

            $suratMasuk->tujuans()->delete();
            $this->syncTujuan($suratMasuk, $tujuanList, $oldTujuanAgendas, $oldTujuanPenerimaan);

            CacheHelper::flush(['persuratan_list']);

            return $suratMasuk;
        });
    }

    /**
     * Hard-delete a surat masuk.
     * 
     * @param SuratMasuk $suratMasuk
     * @return void
     */
    public function delete(SuratMasuk $suratMasuk): void
    {
        /** @var \Illuminate\Database\Eloquent\Model $suratMasuk */
        $suratMasuk->delete();
        CacheHelper::flush(['persuratan_list']);
    }

    // ==================== PRIVATE: INDEX HELPERS ====================

    /**
     * Apply role-based visibility filters to the query.
     */
    private function applyVisibilityScope($query, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return; // SuperAdmin sees all
        }

        if ($user->isTU()) {
            // TU sees: surat they created manually OR surat addressed to them
            // (excluding auto-created from Surat Keluar)
            $query->where(function ($q) use ($user) {
                $q->whereIn('id', function ($subq) use ($user) {
                    $subq->select('surat_masuk_id')
                        ->from('surat_masuk_tujuans')
                        ->where('tujuan_id', $user->id);
                })
                    ->orWhere(function ($subq) use ($user) {
                        $subq->where('created_by', $user->id)
                            ->whereNotExists(function ($existsQuery) use ($user) {
                                $existsQuery->select(DB::raw(1))
                                    ->from('surat_keluars')
                                    ->whereColumn('surat_keluars.nomor_surat', 'surat_masuks.nomor_surat')
                                    ->where('surat_keluars.created_by', $user->id)
                                    ->whereNull('surat_keluars.deleted_at');
                            });
                    });
            });
        } else {
            // Regular users only see surat addressed to them
            $query->whereIn('id', function ($q) use ($user) {
                $q->select('surat_masuk_id')
                    ->from('surat_masuk_tujuans')
                    ->where('tujuan_id', $user->id);
            });
        }
    }

    /**
     * Enrich a SuratMasuk with computed permission flags for the given user.
     */
    private function enrichWithPermissions(SuratMasuk $surat, User $user): SuratMasuk
    {
        $tujuan = $surat->tujuans->firstWhere('tujuan_id', $user->id);

        // Resolve per-user nomor_agenda
        if ($tujuan && $tujuan->nomor_agenda) {
            $surat->nomor_agenda = $tujuan->nomor_agenda;
        }

        $isDisposeRecipient = (bool) $tujuan && $user->canDispose();
        $isAcceptedByCurrentUser = $tujuan?->status_penerimaan === SuratMasukTujuan::STATUS_DITERIMA;
        $isTembusan = (bool) $tujuan?->is_tembusan;

        $canScheduleByBupati = Gate::forUser($user)->check('scheduleByBupati', $surat);
        $hasSchedule = (bool) $surat->penjadwalan;
        $scheduleFollowUpStatus = $this->resolveScheduleFollowUpStatus($surat->penjadwalan);

        // Cek apakah user bisa melakukan aksi (primary recipient / disposisi penerima)
        $canDoAction = Gate::forUser($user)->check('disposisi', $surat);

        $hasDisposed = DisposisiSurat::where('surat_masuk_id', $surat->id)
            ->where('dari_user_id', $user->id)
            ->exists();

        $surat->penerimaan_status = $this->resolvePenerimaanStatus($surat, $tujuan);
        $surat->penerimaan_diterima_at = $tujuan?->diterima_at?->toDateTimeString();
        $surat->can_accept = $isDisposeRecipient && !$isAcceptedByCurrentUser && !$isTembusan;

        // Flow Baru: Surat Masuk hanya bisa dimasukkan ke jadwal setelah diterima, belum masuk jadwal, belum didisposisi.
        $surat->can_masukkan_jadwal = $isDisposeRecipient && $isAcceptedByCurrentUser && !$isTembusan && !$hasSchedule && !$hasDisposed;
        $surat->can_cetak_disposisi = ($isDisposeRecipient && $isAcceptedByCurrentUser) || $hasDisposed;

        $canScheduleByBupati = Gate::forUser($user)->check('scheduleByBupati', $surat);
        $surat->can_view_schedule = $hasSchedule
            && ($canScheduleByBupati || ($isDisposeRecipient && $isAcceptedByCurrentUser));

        // Status Tindak Lanjut 
        if (!$tujuan) {
            // Jika user bukan penerima (contoh: TU / Superadmin), tampilkan progress global
            $globalHasDisposed = DisposisiSurat::where('surat_masuk_id', $surat->id)->exists();
            $globalIsAccepted = $surat->penerimaan_status === SuratMasukTujuan::STATUS_DITERIMA;

            if (!$globalIsAccepted) {
                $surat->status_tindak_lanjut = "Menunggu Tindak Lanjut";
            } elseif ($hasSchedule) {
                $surat->status_tindak_lanjut = $scheduleFollowUpStatus;
            } elseif ($globalHasDisposed) {
                $surat->status_tindak_lanjut = "Telah Didisposisi";
            } else {
                $surat->status_tindak_lanjut = "Diterima / Diketahui";
            }
        } else {
            // Logika untuk penerima spesifik
            if (!$isAcceptedByCurrentUser) {
                $surat->status_tindak_lanjut = "Menunggu Tindak Lanjut";
            } elseif ($hasSchedule) {
                $surat->status_tindak_lanjut = $scheduleFollowUpStatus;
            } elseif ($hasDisposed) {
                $surat->status_tindak_lanjut = "Telah Didisposisi";
            } else {
                $surat->status_tindak_lanjut = "Diterima / Diketahui";
            }
        }

        return $surat;
    }

    /**
     * Resolve the penerimaan status for display.
     */
    private function resolvePenerimaanStatus(SuratMasuk $surat, ?SuratMasukTujuan $currentUserTujuan): string
    {
        if ($currentUserTujuan) {
            return $currentUserTujuan->status_penerimaan ?? '-';
        }

        $disposableTujuans = $surat->tujuans->filter(function (SuratMasukTujuan $tujuan) {
            $recipient = $tujuan->user;
            if (!$recipient) {
                return false;
            }
            return $recipient->canDispose();
        });

        if ($disposableTujuans->isEmpty()) {
            return '-';
        }

        $allAccepted = $disposableTujuans->every(
            fn(SuratMasukTujuan $tujuan) => $tujuan->status_penerimaan === SuratMasukTujuan::STATUS_DITERIMA
        );

        return $allAccepted
            ? SuratMasukTujuan::STATUS_DITERIMA
            : SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN;
    }

    /**
     * Resolve the penjadwalan badge variant.
     */
    private function resolvePenjadwalanVariant(?Penjadwalan $penjadwalan): string
    {
        if (!$penjadwalan) {
            return 'default';
        }

        return match ($penjadwalan->status) {
            Penjadwalan::STATUS_TENTATIF => 'warning',
            Penjadwalan::STATUS_DEFINITIF => 'success',
            default => 'default',
        };
    }

    private function resolveScheduleFollowUpStatus(?Penjadwalan $penjadwalan): string
    {
        if (!$penjadwalan) {
            return "Menunggu Tindak Lanjut";
        }

        return $penjadwalan->status === Penjadwalan::STATUS_DEFINITIF
            ? "Telah Masuk Jadwal Definitif"
            : "Telah Masuk Jadwal Tentatif";
    }

    // ==================== PRIVATE: TUJUAN SYNC ====================

    /**
     * Create tujuan records for a surat masuk.
     * Setiap penerima mendapat nomor agenda masing-masing.
     *
     * @param array<int, string> $oldAgendas Nomor agenda lama per tujuan_id (untuk update/reuse)
     * @param array<int, array{status_penerimaan: string|null, diterima_at: \Illuminate\Support\Carbon|string|null}> $oldPenerimaan
     */
    private function syncTujuan(
        SuratMasuk $suratMasuk,
        array $tujuanList,
        array $oldAgendas = [],
        array $oldPenerimaan = []
    ): void {
        if (empty($tujuanList)) {
            return;
        }

        // Batch load all users with jabatan to avoid N+1 queries
        $numericIds = array_filter($tujuanList, 'is_numeric');
        $users = !empty($numericIds)
            ? User::with('jabatanRelasi')->whereIn('id', $numericIds)->get()->keyBy('id')
            : collect();

        // Tentukan primary recipient: user dengan level jabatan terendah (angka terkecil)
        $primaryUserId = null;
        $lowestLevel = PHP_INT_MAX;
        foreach ($tujuanList as $tujuan) {
            if (!is_numeric($tujuan)) continue;
            /** @var User $userData */
            $userData = $users->get($tujuan);
            if (!$userData) continue;
            $level = $userData->getJabatanLevel() ?? PHP_INT_MAX;
            if ($level < $lowestLevel) {
                $lowestLevel = $level;
                $primaryUserId = $userData->id;
            }
        }

        foreach ($tujuanList as $tujuan) {
            $userData = is_numeric($tujuan) ? $users->get($tujuan) : null;

            // Generate nomor agenda per-recipient (hanya untuk user internal)
            $nomorAgenda = null;
            if ($userData) {
                // Reuse nomor agenda lama jika ada (untuk update)
                $nomorAgenda = $oldAgendas[$userData->id] ?? SuratMasukTujuan::generateNomorAgendaForRecipient($userData->id);
            }

            $penerimaanState = $userData && isset($oldPenerimaan[$userData->id])
                ? [
                    'status_penerimaan' => $oldPenerimaan[$userData->id]['status_penerimaan']
                        ?? SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
                    'diterima_at' => $oldPenerimaan[$userData->id]['diterima_at'] ?? null,
                ]
                : SuratMasukTujuan::initialPenerimaanState($userData);

            // Auto-determine primary vs tembusan
            $isPrimary = $userData && $userData->id === $primaryUserId;
            $isTembusan = $userData && !$isPrimary && count($tujuanList) > 1;

            SuratMasukTujuan::create([
                'surat_masuk_id' => $suratMasuk->id,
                'tujuan_id' => $userData?->id ?? null,
                'tujuan' => $userData?->jabatan_nama ?? $userData?->name ?? $tujuan,
                'nomor_agenda' => $nomorAgenda,
                'is_primary' => $isPrimary,
                'is_tembusan' => $isTembusan,
                'status_penerimaan' => $penerimaanState['status_penerimaan'],
                'diterima_at' => $penerimaanState['diterima_at'],
            ]);
        }
    }
}
