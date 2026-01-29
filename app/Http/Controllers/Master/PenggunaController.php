<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PenggunaController extends Controller
{
    /**
     * Check if current user can manage users
     */
    private function authorizeUserManagement(): void
    {
        /** @var User|null $user */
        $user = \Illuminate\Support\Facades\Auth::user();
        if (!$user || !$user->canManageUsers()) {
            abort(403, 'Anda tidak memiliki akses untuk mengelola pengguna.');
        }
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $this->authorizeUserManagement();

        $query = User::query()
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('username', 'ilike', "%{$search}%")
                    ->orWhere('nip', 'ilike', "%{$search}%")
            )
            ->when($request->role, fn($q, $role) => $q->where('role', $role))
            ->orderBy('name');

        return Inertia::render('Master/Pengguna/Index', [
            'data' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'role']),
            'roles' => User::ROLE_LABELS,
            'modules' => User::MODULES,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorizeUserManagement();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', Rule::in(User::ROLES)],
            'nip' => ['nullable', 'string', 'max:30'],
            'jenis_kelamin' => ['nullable', Rule::in(['L', 'P'])],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'module_access' => ['nullable', 'array'],
            'module_access.*' => ['string'],
            'foto' => ['nullable', 'image', 'max:2048'], // Max 2MB
        ]);

        // Handle foto upload
        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('users', 'public');
        }

        User::create($validated);

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $pengguna): RedirectResponse
    {
        $this->authorizeUserManagement();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($pengguna->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users')->ignore($pengguna->id)],
            'password' => ['nullable', Password::defaults()],
            'role' => ['required', Rule::in(User::ROLES)],
            'nip' => ['nullable', 'string', 'max:30'],
            'jenis_kelamin' => ['nullable', Rule::in(['L', 'P'])],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'module_access' => ['nullable', 'array'],
            'module_access.*' => ['string'],
            'foto' => ['nullable', 'image', 'max:2048'],
        ]);

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
        }

        $pengguna->update($validated);

        return back()->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Remove the specified user (soft delete).
     */
    public function destroy(User $pengguna): RedirectResponse
    {
        $this->authorizeUserManagement();

        // Prevent self-deletion
        /** @var User|null $currentUser */
        $currentUser = \Illuminate\Support\Facades\Auth::user();
        if ($currentUser && $pengguna->id === $currentUser->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $pengguna->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }

    /**
     * Display archived (soft deleted) users.
     */
    public function archive(Request $request): Response
    {
        $this->authorizeUserManagement();

        $query = User::onlyTrashed()
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where('name', 'ilike', "%{$search}%")
            )
            ->orderBy('deleted_at', 'desc');

        return Inertia::render('Master/Pengguna/Archive', [
            'data' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore a soft deleted user.
     */
    public function restore(string $id): RedirectResponse
    {
        $this->authorizeUserManagement();

        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return back()->with('success', 'Pengguna berhasil dipulihkan.');
    }

    /**
     * Permanently delete a user.
     */
    public function forceDelete(string $id): RedirectResponse
    {
        $this->authorizeUserManagement();

        $user = User::onlyTrashed()->findOrFail($id);

        // Delete foto
        if ($user->foto) {
            Storage::disk('public')->delete($user->foto);
        }

        $user->forceDelete();

        return back()->with('success', 'Pengguna berhasil dihapus permanen.');
    }
}
