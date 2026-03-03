<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $user->load('jabatanRelasi:id,nama,level');

        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'nip' => $user->nip,
                'jabatan_nama' => $user->jabatan_nama,
                'jenis_kelamin' => $user->jenis_kelamin,
                'foto_url' => $user->foto_url,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     * Jabatan tidak bisa diubah di sini — hanya via Data Master Pengguna.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'nip' => 'nullable|string|max:30',
            'jenis_kelamin' => 'nullable|in:L,P',
            'current_password' => 'nullable|required_with:new_password|current_password',
            'new_password' => 'nullable|min:8|confirmed',
        ], [
            'current_password.current_password' => 'Password lama tidak sesuai.',
            'current_password.required_with' => 'Password lama wajib diisi jika ingin mengubah password.',
            'new_password.min' => 'Password baru minimal 8 karakter.',
            'new_password.confirmed' => 'Konfirmasi password tidak sesuai.',
        ]);

        // Only validate and update foto if a file was actually uploaded
        if ($request->hasFile('foto')) {
            $request->validate([
                'foto' => 'image|max:2048', // 2MB Max
            ], [
                'foto.image' => 'File harus berupa gambar.',
                'foto.max' => 'Ukuran foto maksimal 2MB.',
            ]);

            // Delete old photo if exists
            if ($user->foto) {
                Storage::disk('public')->delete($user->foto);
            }
            $path = $request->file('foto')->store('profile-photos', 'public');
            $user->foto = $path;
        }

        // Update password if provided
        if ($request->filled('new_password')) {
            $user->password = bcrypt($request->new_password);
        }

        // Remove password fields from validated array before fill
        unset($validated['current_password'], $validated['new_password'], $validated['new_password_confirmation']);

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
