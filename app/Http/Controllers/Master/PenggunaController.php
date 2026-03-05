<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\PenggunaRequest;
use App\Models\Jabatan;
use App\Models\User;
use App\Support\CacheHelper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PenggunaController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        /** @var User $currentUser */
        $currentUser = Auth::user();
        abort_unless($currentUser->canManageUsers(), 403, 'Anda tidak memiliki akses untuk mengelola pengguna.');

        $isTU = $currentUser->isTU();
        $isSuperAdmin = $currentUser->isSuperAdmin();

        $query = User::query()
            ->with(['creator:id,name,role', 'jabatanRelasi:id,nama,level'])
            ->when($isTU, fn($q) => $q->where('role', '!=', User::ROLE_SUPERADMIN))
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('nip', 'ilike', "%{$search}%")
                        ->orWhereHas('jabatanRelasi', fn($jq) => $jq->where('nama', 'ilike', "%{$search}%"));
                })
            )
            ->when($request->role, fn($q, $role) => $q->where('role', $role))
            ->orderBy('name');

        // Filter role labels: TU tidak bisa membuat role Super Admin
        $roles = User::ROLE_LABELS;
        if ($isTU) {
            unset($roles[User::ROLE_SUPERADMIN]);
        }

        return Inertia::render('Master/Pengguna/Index', [
            'data' => Inertia::defer(fn() => CacheHelper::tags(['master_list'])->remember('pengguna_list_' . request('page', 1) . '_' . md5(json_encode(request()->query())) . '_' . $currentUser->role, 60, function () use ($query, $isSuperAdmin) {
                $users = $query->get();

                // SuperAdmin bisa melihat plain_password semua user
                if ($isSuperAdmin) {
                    $users->each(function ($user) {
                        $user->makeVisible('plain_password');
                    });
                }

                return $users;
            })),
            'filters' => $request->only(['search', 'role']),
            'roles' => $roles,
            'jabatans' => Jabatan::ordered()->get(['id', 'nama', 'level']),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(PenggunaRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Simpan plain_password terenkripsi untuk Super Admin
        if (!empty($validated['password'])) {
            $validated['plain_password'] = $validated['password'];
        }

        // Handle foto upload
        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('users', 'public');
        }

        // Catat siapa yang menambahkan pengguna ini
        $validated['created_by'] = Auth::id();

        // SuperAdmin tidak boleh punya jabatan
        if (($validated['role'] ?? '') === User::ROLE_SUPERADMIN) {
            $validated['jabatan_id'] = null;
        }

        User::create($validated);

        CacheHelper::flush(['master_list']);

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Update the specified user.
     */
    public function update(PenggunaRequest $request, User $pengguna): RedirectResponse
    {
        /** @var User $currentUser */
        $currentUser = Auth::user();

        // TU cannot edit SuperAdmin accounts
        if ($currentUser->isTU() && $pengguna->isSuperAdmin()) {
            abort(403, 'Tata Usaha tidak dapat mengedit akun Super Admin.');
        }

        $validated = $request->validated();

        // Handle foto upload
        if ($request->hasFile('foto')) {
            // Delete old foto
            if ($pengguna->foto) {
                Storage::disk('public')->delete($pengguna->foto);
            }
            $validated['foto'] = $request->file('foto')->store('users', 'public');
        }

        // Only update password if provided
        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            // Simpan plain_password terenkripsi untuk Super Admin
            $validated['plain_password'] = $validated['password'];
        }

        // SuperAdmin tidak boleh punya jabatan
        if (($validated['role'] ?? $pengguna->role) === User::ROLE_SUPERADMIN) {
            $validated['jabatan_id'] = null;
        }

        $pengguna->update($validated);

        CacheHelper::flush(['master_list']);

        return back()->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Remove the specified user permanently (hard delete).
     */
    public function destroy(User $pengguna): RedirectResponse
    {
        /** @var User $currentUser */
        $currentUser = Auth::user();
        abort_unless($currentUser->canManageUsers(), 403);

        // TU cannot delete SuperAdmin accounts
        if ($currentUser->isTU() && $pengguna->isSuperAdmin()) {
            return back()->with('error', 'Tata Usaha tidak dapat menghapus akun Super Admin.');
        }
        if ($currentUser && $pengguna->id === $currentUser->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        // Hapus foto jika ada
        if ($pengguna->foto) {
            Storage::disk('public')->delete($pengguna->foto);
        }

        $pengguna->delete();

        CacheHelper::flush(['master_list']);

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
