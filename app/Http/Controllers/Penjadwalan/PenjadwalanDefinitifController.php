<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Resources\Penjadwalan\PenjadwalanResource;
use App\Models\Penjadwalan;
use App\Models\SifatSurat;
use App\Models\User;
use App\Services\Penjadwalan\PenjadwalanService;
use App\Support\CacheHelper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenjadwalanDefinitifController extends Controller
{
    private const CALENDAR_STATUS_SEKRETARIS_DAERAH = 'sekretaris_daerah';

    public function __construct(private readonly PenjadwalanService $service) {}

    /**
     * Display calendar view for definitif penjadwalan.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Penjadwalan::class);

        return Inertia::render('Penjadwalan/Definitif/Index', [
            'sifatOptions' => SifatSurat::getOptions(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Get calendar data in FullCalendar format
     */
    public function calendarData(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $query = Penjadwalan::query()
            ->definitif()
            ->with([
                'suratMasuk.tujuans.user',
                'suratMasuk.jenisSurat',
                'suratMasuk.indeksBerkas',
                'suratMasuk.kodeKlasifikasi',
                'suratMasuk.staffPengolah',
                'suratMasuk.disposisis.keUser.jabatanRelasi',
                'suratMasuk.createdBy',
                'creator',
                'dihadiriOlehUser.jabatanRelasi',
            ]);

        if (!$this->canViewAllDefinitif($user)) {
            $this->applyUserScope($query, $user);
        }

        // Search
        if ($request->has('search') && $request->input('search')) {
            $query->search($request->input('search'));
        }

        $penjadwalan = $query->get();

        $events = $penjadwalan->map(function (Penjadwalan $item) {
            $calendarStatus = $this->resolveCalendarStatus($item);

            // Gunakan getRawOriginal untuk menghindari timezone shift dari Carbon
            $date = $item->getRawOriginal('tanggal_agenda');
            // Jika raw original mengembalikan format lengkap (misal di DB), ambil Y-m-d saja
            if ($date && strlen($date) > 10) {
                $date = substr($date, 0, 10);
            }

            return [
                'id' => $item->id,
                'title' => $item->nama_kegiatan,
                'start' => ($date ?: $item->tanggal_agenda->format('Y-m-d')) . 'T' . $item->waktu_mulai,
                'end' => $item->sampai_selesai
                    ? null
                    : ($item->waktu_selesai
                        ? ($date ?: $item->tanggal_agenda->format('Y-m-d')) . 'T' . $item->waktu_selesai
                        : null),
                'allDay' => false,
                'classNames' => ['event-' . $calendarStatus],
                'extendedProps' => [
                    'agenda' => new PenjadwalanResource($item),
                    'status_disposisi' => $calendarStatus,
                ],
            ];
        });

        return response()->json($events);
    }

    /**
     * Get detail penjadwalan for modal
     */
    public function show(string $id)
    {
        $penjadwalan = Penjadwalan::with([
            'suratMasuk.tujuans.user',
            'suratMasuk.jenisSurat',
            'suratMasuk.indeksBerkas',
            'suratMasuk.kodeKlasifikasi',
            'suratMasuk.staffPengolah',
            'suratMasuk.disposisis.keUser.jabatanRelasi',
            'suratMasuk.createdBy',
            'creator',
            'updater',
        ])
            ->findOrFail($id);
        $this->authorize('view', $penjadwalan);

        return response()->json(new PenjadwalanResource($penjadwalan));
    }

    /**
     * Hapus jadwal definitif: jadwal berbasis surat dikembalikan ke tentatif, custom dihapus.
     */
    public function destroy(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('delete', $penjadwalan);

        if ($penjadwalan->surat_masuk_id) {
            /** @var \App\Models\User $requestUser */
            $requestUser = request()->user();
            $this->service->revertDefinitifToTentatif($penjadwalan, $requestUser);

            return redirect()->back()
                ->with('success', 'Jadwal definitif dikembalikan ke Jadwal Tentatif.');
        }

        $this->service->delete($penjadwalan);

        return redirect()->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }

    /**
     * Resolve warna kalender berdasarkan status disposisi/kehadiran aktual.
     */
    private function resolveCalendarStatus(Penjadwalan $item): string
    {
        if (($item->status_kehadiran ?? null) === 'Diwakilkan') {
            return Penjadwalan::DISPOSISI_DIWAKILKAN;
        }

        $level = $item->dihadiriOlehUser?->jabatanRelasi?->level;

        $levelStatus = match ($level) {
            1 => Penjadwalan::DISPOSISI_BUPATI,
            2 => Penjadwalan::DISPOSISI_WAKIL_BUPATI,
            3 => self::CALENDAR_STATUS_SEKRETARIS_DAERAH,
            default => null,
        };

        if ($levelStatus) {
            return $levelStatus;
        }

        return match ($item->status_disposisi) {
            Penjadwalan::DISPOSISI_BUPATI => Penjadwalan::DISPOSISI_BUPATI,
            Penjadwalan::DISPOSISI_WAKIL_BUPATI => Penjadwalan::DISPOSISI_WAKIL_BUPATI,
            default => Penjadwalan::DISPOSISI_DIWAKILKAN,
        };
    }

    private function applyUserScope(Builder $query, User $user): void
    {
        $isRestrictedPejabat = $user->isPejabat() && in_array($user->getJabatanLevel(), [6, 7], true);

        $query->where(function (Builder $scope) use ($user, $isRestrictedPejabat) {
            if (!$isRestrictedPejabat) {
                // 1. Jadwal Custom (Tanpa Surat Masuk)
                $scope->where(function (Builder $customQuery) use ($user) {
                    $customQuery->whereNull('surat_masuk_id')
                        ->where(function (Builder $customOwnerQuery) use ($user) {
                            $customOwnerQuery
                                ->where('created_by', $user->id)
                                ->orWhere('dihadiri_oleh_user_id', $user->id);
                        });
                });
            }

            $suratScope = function (Builder $suratScheduleQuery) use ($user) {
                $suratScheduleQuery->whereNotNull('surat_masuk_id')
                    ->where(function (Builder $relatedQuery) use ($user) {
                        $relatedQuery
                            ->where('dihadiri_oleh_user_id', $user->id)
                            ->orWhereHas('suratMasuk', function (Builder $smQuery) use ($user) {
                                $smQuery->where('created_by', $user->id)
                                    ->orWhereHas('tujuans', function (Builder $tujuanQuery) use ($user) {
                                        $tujuanQuery->where('tujuan_id', $user->id);
                                    });
                            })
                            ->orWhereHas('suratMasuk.disposisis', function (Builder $disposisiQuery) use ($user) {
                                $disposisiQuery->where('dari_user_id', $user->id)
                                    ->orWhere('ke_user_id', $user->id);
                            });
                    });
            };

            if ($isRestrictedPejabat) {
                $scope->where($suratScope);
            } else {
                $scope->orWhere($suratScope);
            }
        });
    }

    private function canViewAllDefinitif(User $user): bool
    {
        return $user->canMonitorAllSchedules();
    }
}
