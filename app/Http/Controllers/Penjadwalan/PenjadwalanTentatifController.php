<?php

namespace App\Http\Controllers\Penjadwalan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Jadwal\TindakLanjutRequest;
use App\Http\Resources\Penjadwalan\PenjadwalanResource;
use App\Models\Penjadwalan;
use App\Models\SifatSurat;
use App\Models\User;
use App\Services\Penjadwalan\PenjadwalanService;
use App\Support\CacheHelper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PenjadwalanTentatifController extends Controller
{
    public function __construct(private readonly PenjadwalanService $service) {}

    /**
     * Display a listing of tentatif penjadwalan (semua status disposisi dalam 1 tabel).
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Penjadwalan::class);

        /** @var User $user */
        $user = $request->user();
        $search = $request->input('search');
        $cacheKey = sprintf(
            'tentatif_all_%d_%s',
            $user->id,
            md5((string) $search)
        );

        return Inertia::render('Penjadwalan/Tentatif/Index', [
            'tentatif' => Inertia::defer(fn() => CacheHelper::tags(['penjadwalan'])->remember($cacheKey, 60, function () use ($search, $user) {
                $query = Penjadwalan::query()
                    ->where('status', Penjadwalan::STATUS_TENTATIF)
                    ->when(
                        !($user->isSuperAdmin() || $this->isBupati($user)),
                        fn(Builder $builder) => $this->applyUserScope($builder, $user)
                    )
                    ->with([
                        'suratMasuk.tujuans',
                        'suratMasuk.jenisSurat',
                        'suratMasuk.indeksBerkas',
                        'suratMasuk.kodeKlasifikasi',
                        'suratMasuk.staffPengolah',
                        'suratMasuk.disposisis',
                        'suratMasuk.createdBy',
                        'creator',
                    ])
                    ->search($search)
                    ->latest('tanggal_agenda')
                    ->get();
                return PenjadwalanResource::collection($query);
            })),
            'sifatOptions' => SifatSurat::getOptions(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Update data jadwal dan jadikan definitif
     */
    public function tindakLanjut(TindakLanjutRequest $request, string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('update', $penjadwalan);

        try {
            $this->service->tindakLanjut($penjadwalan, $request->validated(), $request->user());

            return redirect()->back()
                ->with('success', 'Jadwal berhasil ditindaklanjuti dan menjadi definitif.');
        } catch (\Exception $e) {
            Log::error('Gagal menindaklanjuti jadwal', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Gagal menindaklanjuti jadwal. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Delete penjadwalan permanently.
     */
    public function destroy(string $id)
    {
        $penjadwalan = Penjadwalan::findOrFail($id);
        $this->authorize('delete', $penjadwalan);

        $this->service->delete($penjadwalan);

        return redirect()->back()
            ->with('success', 'Jadwal berhasil dihapus.');
    }

    private function applyUserScope(Builder $query, User $user): void
    {
        $isRestrictedPejabat = $user->isPejabat() && in_array($user->getJabatanLevel(), [6, 7], true);

        $query->where(function (Builder $scope) use ($user, $isRestrictedPejabat) {
            if (!$isRestrictedPejabat) {
                // Jadwal custom: hanya terkait user tersebut.
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
                            ->orWhereHas('suratMasuk', function (Builder $suratQuery) use ($user) {
                                $suratQuery->where('created_by', $user->id)
                                    ->orWhereHas('tujuans', function (Builder $tujuanQuery) use ($user) {
                                        $tujuanQuery->where('tujuan_id', $user->id);
                                    })
                                    ->orWhereHas('disposisis', function (Builder $disposisiQuery) use ($user) {
                                        $disposisiQuery
                                            ->where('dari_user_id', $user->id)
                                            ->orWhere('ke_user_id', $user->id);
                                    });
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

    private function isBupati(User $user): bool
    {
        return $user->getJabatanLevel() === 1;
    }
}
