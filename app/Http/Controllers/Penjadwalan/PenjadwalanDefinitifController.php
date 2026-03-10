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
            'disposisiOptions' => Penjadwalan::DISPOSISI_OPTIONS,
            'sifatOptions' => SifatSurat::getOptions(),
            'filters' => $request->only(['search', 'status_disposisi']),
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

            // Filter by date range (for calendar pagination)
            if ($request->has('start') && $request->has('end')) {
                $query->whereBetween('tanggal_agenda', [
                    $request->input('start'),
                    $request->input('end'),
                ]);
            }

            // Filter by status_disposisi
            if ($request->has('status_disposisi') && $request->input('status_disposisi')) {
                $query->where('status_disposisi', $request->input('status_disposisi'));
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
        $query->where(function (Builder $scope) use ($user) {
            $scope->where(function (Builder $customQuery) use ($user) {
                $customQuery->whereNull('surat_masuk_id')
                    ->where(function (Builder $customOwnerQuery) use ($user) {
                        $customOwnerQuery
                            ->where('created_by', $user->id)
                            ->orWhere('dihadiri_oleh_user_id', $user->id);
                    });
            });

            $scope->orWhere(function (Builder $suratScheduleQuery) use ($user) {
                $suratScheduleQuery->whereNotNull('surat_masuk_id')
                    ->where('dihadiri_oleh_user_id', $user->id)
                    ->whereHas('suratMasuk', function (Builder $suratQuery) use ($user) {
                        $suratQuery->whereHas('disposisis', function (Builder $disposisiQuery) use ($user) {
                            $disposisiQuery->where('ke_user_id', $user->id);
                        });
                    });
            });
        });
    }

    private function canViewAllDefinitif(User $user): bool
    {
        if ($user->isSuperAdmin() || $user->isTU()) {
            return true;
        }

        $level = $user->getJabatanLevel();
        if (in_array($level, [1, 2, 3], true)) {
            return true;
        }

        $jabatanNama = strtolower((string) $user->jabatan_nama);
        return str_contains($jabatanNama, 'sekretaris daerah');
    }
}
