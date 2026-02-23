<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Models\JadwalHistory;
use App\Models\Penjadwalan;
use App\Support\CacheHelper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PenjadwalanHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Penjadwalan::class);

        $search = trim((string) $request->input('search', ''));
        $statusFormal = trim((string) $request->input('status_formal', ''));
        $page = max(1, (int) $request->input('page', 1));

        $cacheKey = 'penjadwalan_history_' . md5(json_encode([
            'search' => $search,
            'status_formal' => $statusFormal,
            'page' => $page,
        ]));

        return Inertia::render('Penjadwalan/History/Index', [
            'histories' => Inertia::defer(fn() => CacheHelper::tags(['penjadwalan'])->remember(
                $cacheKey,
                60,
                function () use ($search, $statusFormal) {
                    $query = Penjadwalan::query()
                        ->with([
                            'suratMasuk' => fn($suratQuery) => $suratQuery
                                ->select(['id', 'nomor_agenda', 'nomor_surat', 'asal_surat', 'perihal']),
                            'creator:id,name',
                            'updater:id,name',
                            'histories.changedBy:id,name',
                        ])
                        ->when($search !== '', function ($q) use ($search) {
                            $q->where(function ($subQuery) use ($search) {
                                $subQuery->where('nama_kegiatan', 'ilike', "%{$search}%")
                                    ->orWhere('tempat', 'ilike', "%{$search}%")
                                    ->orWhereHas('suratMasuk', function ($suratQuery) use ($search) {
                                        $suratQuery->where('nomor_agenda', 'ilike', "%{$search}%")
                                            ->orWhere('nomor_surat', 'ilike', "%{$search}%")
                                            ->orWhere('asal_surat', 'ilike', "%{$search}%")
                                            ->orWhere('perihal', 'ilike', "%{$search}%");
                                    });
                            });
                        })
                        ->when($statusFormal !== '', function (Builder $q) use ($statusFormal) {
                            $this->applyStatusFormalFilter($q, $statusFormal);
                        })
                        ->latest('updated_at');

                    $paginator = $query->paginate(10)->withQueryString();

                    $paginator->setCollection(
                        $paginator->getCollection()->map(fn(Penjadwalan $item) => $this->serializePenjadwalan($item))
                    );

                    return $paginator;
                }
            )),
            'statusFormalOptions' => Penjadwalan::STATUS_FORMAL_OPTIONS,
            'filters' => [
                'search' => $search,
                'status_formal' => $statusFormal,
            ],
        ]);
    }

    private function serializePenjadwalan(Penjadwalan $penjadwalan): array
    {
        return [
            'id' => $penjadwalan->id,
            'nama_kegiatan' => $penjadwalan->nama_kegiatan,
            'tanggal_agenda' => $penjadwalan->tanggal_agenda?->format('Y-m-d'),
            'tanggal_agenda_formatted' => $penjadwalan->tanggal_formatted,
            'waktu_lengkap' => $penjadwalan->waktu_lengkap,
            'status' => $penjadwalan->status,
            'status_label' => $penjadwalan->status_label,
            'status_formal' => $penjadwalan->status_formal,
            'status_formal_label' => $penjadwalan->status_formal_label,
            'status_disposisi' => $penjadwalan->status_disposisi,
            'status_disposisi_label' => $penjadwalan->status_disposisi_label,
            'dihadiri_oleh' => $penjadwalan->dihadiri_oleh,
            'surat_masuk' => $penjadwalan->suratMasuk ? [
                'id' => $penjadwalan->suratMasuk->id,
                'nomor_agenda' => $penjadwalan->suratMasuk->nomor_agenda,
                'nomor_surat' => $penjadwalan->suratMasuk->nomor_surat,
                'asal_surat' => $penjadwalan->suratMasuk->asal_surat,
                'perihal' => $penjadwalan->suratMasuk->perihal,
            ] : null,
            'created_by' => $penjadwalan->creator ? [
                'id' => $penjadwalan->creator->id,
                'name' => $penjadwalan->creator->name,
            ] : null,
            'updated_by' => $penjadwalan->updater ? [
                'id' => $penjadwalan->updater->id,
                'name' => $penjadwalan->updater->name,
            ] : null,
            'created_at' => $penjadwalan->created_at?->format('Y-m-d H:i:s'),
            'created_at_formatted' => $penjadwalan->created_at?->translatedFormat('d M Y H:i'),
            'updated_at' => $penjadwalan->updated_at?->format('Y-m-d H:i:s'),
            'updated_at_formatted' => $penjadwalan->updated_at?->translatedFormat('d M Y H:i'),
            'histories' => $penjadwalan->histories->map(
                fn(JadwalHistory $history) => $this->serializeHistory($history)
            )->values()->all(),
        ];
    }

    private function serializeHistory(JadwalHistory $history): array
    {
        $oldData = is_array($history->old_data) ? $history->old_data : [];
        $newData = is_array($history->new_data) ? $history->new_data : [];

        return [
            'id' => $history->id,
            'changed_by' => $history->changedBy ? [
                'id' => $history->changedBy->id,
                'name' => $history->changedBy->name,
            ] : null,
            'created_at' => $history->created_at?->format('Y-m-d H:i:s'),
            'created_at_formatted' => $history->created_at?->translatedFormat('d M Y H:i'),
            'changes' => $this->extractChanges($oldData, $newData),
        ];
    }

    private function extractChanges(array $oldData, array $newData): array
    {
        $trackedFields = [
            'tanggal_agenda' => 'Tanggal Agenda',
            'waktu_mulai' => 'Waktu Mulai',
            'waktu_selesai' => 'Waktu Selesai',
            'sampai_selesai' => 'Sampai Selesai',
            'tempat' => 'Tempat',
            'lokasi_type' => 'Tipe Lokasi',
            'status' => 'Status Jadwal',
            'status_disposisi' => 'Status Disposisi',
            'dihadiri_oleh' => 'Dihadiri Oleh',
            'keterangan' => 'Keterangan',
        ];

        $changes = [];

        foreach ($trackedFields as $field => $label) {
            $oldValue = $oldData[$field] ?? null;
            $newValue = $newData[$field] ?? null;

            if ((string) $oldValue === (string) $newValue) {
                continue;
            }

            $changes[] = [
                'field' => $field,
                'label' => $label,
                'old_value' => $this->formatHistoryValue($field, $oldValue),
                'new_value' => $this->formatHistoryValue($field, $newValue),
            ];
        }

        return $changes;
    }

    private function formatHistoryValue(string $field, mixed $value): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return match ($field) {
            'sampai_selesai' => (bool) $value ? 'Ya' : 'Tidak',
            'status' => Penjadwalan::STATUS_OPTIONS[$value] ?? (string) $value,
            'status_disposisi' => Penjadwalan::DISPOSISI_OPTIONS[$value] ?? (string) $value,
            'lokasi_type' => Penjadwalan::LOKASI_TYPE_OPTIONS[$value] ?? (string) $value,
            default => (string) $value,
        };
    }

    private function applyStatusFormalFilter(Builder $query, string $statusFormal): void
    {
        match ($statusFormal) {
            Penjadwalan::STATUS_FORMAL_TERJADWAL => $query
                ->whereNull('deleted_at')
                ->where('status', Penjadwalan::STATUS_DEFINITIF)
                ->whereDate('tanggal_agenda', '>=', today()),
            Penjadwalan::STATUS_FORMAL_SELESAI => $query
                ->whereNull('deleted_at')
                ->where('status', Penjadwalan::STATUS_DEFINITIF)
                ->whereDate('tanggal_agenda', '<', today()),
            Penjadwalan::STATUS_FORMAL_DIDISPOSISIKAN => $query
                ->whereNull('deleted_at')
                ->where('status', Penjadwalan::STATUS_TENTATIF)
                ->where('status_disposisi', '!=', Penjadwalan::DISPOSISI_MENUNGGU),
            Penjadwalan::STATUS_FORMAL_DITUNDA => $query
                ->whereNull('deleted_at')
                ->where('status', Penjadwalan::STATUS_TENTATIF)
                ->where('status_disposisi', Penjadwalan::DISPOSISI_MENUNGGU)
                ->whereDate('tanggal_agenda', '<', today()),
            Penjadwalan::STATUS_FORMAL_DIBATALKAN => $query->whereNotNull('deleted_at'),
            default => $query
                ->whereNull('deleted_at')
                ->where('status', Penjadwalan::STATUS_TENTATIF)
                ->where('status_disposisi', Penjadwalan::DISPOSISI_MENUNGGU)
                ->whereDate('tanggal_agenda', '>=', today()),
        };
    }
}
