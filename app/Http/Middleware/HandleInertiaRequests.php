<?php

namespace App\Http\Middleware;

use App\Models\DisposisiSurat;
use App\Models\Penjadwalan;
use App\Models\SuratMasukTujuan;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'role' => $user->role,
                    'role_label' => $user->role_label,
                    'foto_url' => $user->foto_url,
                    'nip' => $user->nip,
                    'jabatan_nama' => $user->jabatan_nama,
                    'jabatan_level' => $user->getJabatanLevel(),
                    'can_dispose' => $user->canDispose(),
                    'password_changed_at' => $user->password_changed_at,
                ] : null,
            ],
            // Flash messages - dieksekusi langsung, bukan lazy
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'has_conflict' => $request->session()->get('has_conflict', false),
            ],
            'notifications' => fn() => $this->resolveNotifications($request),
        ];
    }

    /**
     * Shared sidebar counters.
     *
     * @return array<string, int>
     */
    private function resolveNotifications(Request $request): array
    {
        $user = $request->user();

        if (!$user) {
            return [
                'surat_masuk_menunggu_penerimaan' => 0,
                'disposisi_belum_diproses' => 0,
                'jadwal_tentatif_pending' => 0,
            ];
        }

        $cacheKey = 'notif_sidebar_' . $user->id;

        return CacheHelper::tags(['persuratan_list', 'penjadwalan'])->remember($cacheKey, 60, function () use ($user) {
            $suratMenunggu = 0;
            $disposisiBelumDiproses = 0;
            $jadwalTentatifPending = 0;

            if ($user->canDispose()) {
                // Surat masuk menunggu penerimaan
                $suratMenunggu = SuratMasukTujuan::query()
                    ->where('tujuan_id', $user->id)
                    ->where('status_penerimaan', SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN)
                    ->whereHas('suratMasuk', fn($q) => $q->whereNull('deleted_at'))
                    ->count();

                // Disposisi yang ditujukan ke user ini dan belum dibaca
                $disposisiBelumDiproses = DisposisiSurat::query()
                    ->where('ke_user_id', $user->id)
                    ->whereNull('dibaca_at')
                    ->count();

                // Jadwal tentatif di mana user adalah pemilik jadwal
                $jadwalTentatifPending = Penjadwalan::query()
                    ->where('pemilik_jadwal_id', $user->id)
                    ->where('status', Penjadwalan::STATUS_TENTATIF)
                    ->whereNull('deleted_at')
                    ->count();
            }

            return [
                'surat_masuk_menunggu_penerimaan' => $suratMenunggu,
                'disposisi_belum_diproses' => $disposisiBelumDiproses,
                'jadwal_tentatif_pending' => $jadwalTentatifPending,
            ];
        });
    }
}
