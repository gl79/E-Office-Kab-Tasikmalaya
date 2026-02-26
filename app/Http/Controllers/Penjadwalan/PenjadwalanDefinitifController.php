<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Resources\Penjadwalan\PenjadwalanResource;
use App\Models\Penjadwalan;
use App\Models\SifatSurat;
use App\Models\SuratMasuk;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenjadwalanDefinitifController extends Controller
{
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
        $cacheKey = "calendar_data_" . md5(json_encode($request->all()));

        $events = CacheHelper::tags(['penjadwalan'])->remember($cacheKey, 60, function () use ($request) {
            $query = Penjadwalan::query()
                ->definitif()
                ->with([
                    'suratMasuk.tujuans',
                    'suratMasuk.jenisSurat',
                    'suratMasuk.indeksBerkas',
                    'suratMasuk.kodeKlasifikasi',
                    'suratMasuk.staffPengolah',
                    'suratMasuk.createdBy',
                    'creator',
                ]);

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
            return $penjadwalan->map(function ($item) {
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
                    'classNames' => ['event-' . $item->status_disposisi],
                    'extendedProps' => [
                        'agenda' => new PenjadwalanResource($item),
                        'status_disposisi' => $item->status_disposisi,
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
        $penjadwalan = Penjadwalan::with(['suratMasuk', 'creator', 'updater'])
            ->findOrFail($id);
        $this->authorize('view', $penjadwalan);

        return response()->json(new PenjadwalanResource($penjadwalan));
    }

    /**
     * Delete penjadwalan permanently.
     */
    public function destroy(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('delete', $penjadwalan);

        $penjadwalan->delete();

        CacheHelper::flush(['penjadwalan']);

        return redirect()->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }
}
