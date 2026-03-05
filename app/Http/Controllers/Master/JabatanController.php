<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\JabatanRequest;
use App\Models\Jabatan;
use App\Support\CacheHelper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class JabatanController extends Controller
{
    /**
     * Display a listing of jabatan.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        abort_unless($user->canManageUsers(), 403, 'Anda tidak memiliki akses untuk mengelola jabatan.');

        return Inertia::render('Master/Jabatan/Index', [
            'data' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember(
                'jabatan_list',
                60,
                fn() => Jabatan::ordered()->get()
            )),
        ]);
    }

    /**
     * Store a newly created jabatan.
     * is_system is never set from user input — only via seeder/migration.
     */
    public function store(JabatanRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['is_system']);
        Jabatan::create($data);

        CacheHelper::flush(['master_list']);

        return back()->with('success', 'Jabatan berhasil ditambahkan.');
    }

    /**
     * Update the specified jabatan.
     * Jabatan sistem tidak boleh diubah sama sekali.
     */
    public function update(JabatanRequest $request, Jabatan $jabatan): RedirectResponse
    {
        if ($jabatan->is_system) {
            return back()->with('error', 'Jabatan sistem tidak dapat diubah.');
        }

        $data = $request->safe()->except(['is_system']);
        $jabatan->update($data);

        CacheHelper::flush(['master_list']);

        return back()->with('success', 'Jabatan berhasil diperbarui.');
    }

    /**
     * Remove the specified jabatan.
     */
    public function destroy(Jabatan $jabatan): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        abort_unless($user->canManageUsers(), 403);

        if ($jabatan->is_system) {
            return back()->with('error', 'Jabatan sistem tidak dapat dihapus.');
        }

        if ($jabatan->isUsedByUsers()) {
            return back()->with('error', 'Jabatan ini masih digunakan oleh pengguna dan tidak dapat dihapus.');
        }

        $jabatan->delete();

        CacheHelper::flush(['master_list']);

        return back()->with('success', 'Jabatan berhasil dihapus.');
    }
}
