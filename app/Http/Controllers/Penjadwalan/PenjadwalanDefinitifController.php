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
        $cacheKey = 'calendar_data_' . $user->id . '_' . md5(json_encode($request->all()));

        $events = CacheHelper::tags(['penjadwalan'])->remember($cacheKey, 60, function () use ($request, $user) {
            $query = Penjadwalan::query()
                ->definitif()
                ->with([
                    'suratMasuk.tujuans',
                    'suratMasuk.jenisSurat',
                    'suratMasuk.indeksBerkas',
                    'suratMasuk.kodeKlasifikasi',
                    'suratMasuk.staffPengolah',
                    'suratMasuk.disposisis',
                    'suratMasuk.createdBy',
                    'creator',
                    'dihadiriOlehUser.jabatanRelasi',
                ]);

            if (!$this->canViewAllDefinitif($user)) {
                $this->applyUserScope($query, $user);
            }

            // Show all schedules regardless of date range if requested, 
            // or if searching to ensure all results are found.
            if ($request->has('start') && $request->has('end') && !$request->has('search')) {
                // Keep the filter only if NOT searching, to maintain performance for normal view
                // but we might want to relax this if the user wants to see ALL in the calendar
                // regardless of the current view. However, FullCalendar handles range by itself.
                // The user said "dont disappear even if date passed". 
                // In a calendar, past events stay unless filtered.
                // It's likely they want them to stay in searching or general lists.
                $query->whereBetween('tanggal_agenda', [
                    $request->input('start'),
                    $request->input('end'),
                ]);
            }

            // Search
            if ($request->has('search') && $request->input('search')) {
                $query->search($request->input('search'));
            }

            $penjadwalan = $query->get();

            // Transform to FullCalendar event format
            // Note: Colors are handled by frontend using CSS variables for consistency
            return $penjadwalan->map(function (Penjadwalan $item) {
                $calendarStatus = $this->resolveCalendarStatus($item);

                return [
                    'id' => $item->id,
                    'title' => $item->nama_kegiatan,
                    'start' => $item->tanggal_agenda->format('Y-m-d') . 'T' . $item->waktu_mulai,
                    'end' => $item->sampai_selesai
                        ? null
                        : ($item->waktu_selesai
                            ? $item->tanggal_agenda->format('Y-m-d') . 'T' . $item->waktu_selesai
                            : null),
                    'allDay' => false,
                    'classNames' => ['event-' . $calendarStatus],
                    'extendedProps' => [
                        'agenda' => new PenjadwalanResource($item),
                        'status_disposisi' => $calendarStatus,
                    ],
                ];
            });
        });

        return response()->json($events);
    }

    /**
     * Get detail penjadwalan for modal
     */
    public function show(string $id)
    {
        $penjadwalan = Penjadwalan::with([
            'suratMasuk.tujuans',
            'suratMasuk.jenisSurat',
            'suratMasuk.indeksBerkas',
            'suratMasuk.kodeKlasifikasi',
            'suratMasuk.staffPengolah',
            'suratMasuk.disposisis',
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

        if ($item->status_disposisi !== Penjadwalan::DISPOSISI_MENUNGGU) {
            return $item->status_disposisi;
        }

        $level = $item->dihadiriOlehUser?->jabatanRelasi?->level;

        return match ($level) {
            1 => Penjadwalan::DISPOSISI_BUPATI,
            2 => Penjadwalan::DISPOSISI_WAKIL_BUPATI,
            default => $item->status_disposisi,
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
