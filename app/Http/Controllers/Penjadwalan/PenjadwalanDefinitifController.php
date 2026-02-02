<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Resources\PenjadwalanResource;
use App\Models\Penjadwalan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenjadwalanDefinitifController extends Controller
{
    /**
     * Display calendar view for definitif penjadwalan.
     */
    public function index(Request $request)
    {
        return Inertia::render('Penjadwalan/Definitif/Index', [
            'disposisiOptions' => Penjadwalan::DISPOSISI_OPTIONS,
            'filters' => $request->only(['search', 'status_disposisi']),
        ]);
    }

    /**
     * Get calendar data in FullCalendar format
     */
    public function calendarData(Request $request)
    {
        $query = Penjadwalan::query()
            ->definitif()
            ->with(['suratMasuk', 'creator']);

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
        $events = $penjadwalan->map(function ($item) {
            // Determine event color based on status_disposisi
            $backgroundColor = $this->getEventColor($item->status_disposisi);

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
                'backgroundColor' => $backgroundColor,
                'borderColor' => $backgroundColor,
                'extendedProps' => [
                    'agenda' => new PenjadwalanResource($item),
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
        $penjadwalan = Penjadwalan::with(['suratMasuk', 'creator', 'updater'])
            ->findOrFail($id);

        return response()->json(new PenjadwalanResource($penjadwalan));
    }

    /**
     * Delete penjadwalan (soft delete)
     */
    public function destroy(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);

        $penjadwalan->delete();

        return redirect()->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }

    /**
     * Get event color based on status_disposisi
     */
    private function getEventColor(string $statusDisposisi): string
    {
        return match ($statusDisposisi) {
            Penjadwalan::DISPOSISI_BUPATI => '#3B82F6',        // Blue
            Penjadwalan::DISPOSISI_WAKIL_BUPATI => '#10B981', // Green
            Penjadwalan::DISPOSISI_DIWAKILKAN => '#F59E0B',   // Amber
            default => '#6B7280',                              // Gray
        };
    }
}
