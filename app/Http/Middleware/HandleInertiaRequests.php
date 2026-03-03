<?php

namespace App\Http\Middleware;

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

        // Hanya user dengan jabatan can_dispose yang perlu notifikasi surat menunggu
        if (!$user || !$user->canDispose()) {
            return [
                'surat_masuk_menunggu_penerimaan' => 0,
            ];
        }

        $cacheKey = 'surat_masuk_menunggu_penerimaan_' . $user->id;

        return [
            'surat_masuk_menunggu_penerimaan' => CacheHelper::tags(['persuratan_list'])->remember($cacheKey, 60, function () use ($user) {
                return SuratMasukTujuan::query()
                    ->where('tujuan_id', $user->id)
                    ->where('status_penerimaan', SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN)
                    ->whereHas('suratMasuk', fn($q) => $q->whereNull('deleted_at'))
                    ->count();
            }),
        ];
    }
}
