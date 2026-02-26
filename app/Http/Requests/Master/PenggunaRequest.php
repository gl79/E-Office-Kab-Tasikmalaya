<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class PenggunaRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User|null $user */
        $user = Auth::user();
        return $user && $user->canManageUsers();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User $currentUser */
        $currentUser = Auth::user();

        $allowedRoles = $currentUser->isTU()
            ? array_diff(User::ROLES, [User::ROLE_SUPERADMIN, User::ROLE_PIMPINAN])
            : User::ROLES;

        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
        $pengguna = $this->route('pengguna');

        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:50',
                $isUpdate
                    ? Rule::unique('users')->ignore($pengguna?->id)
                    : 'unique:users,username',
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                $isUpdate
                    ? Rule::unique('users')->ignore($pengguna?->id)
                    : 'unique:users,email',
            ],
            'password' => [
                $isUpdate ? 'nullable' : 'required',
                Password::defaults(),
            ],
            'role' => ['required', Rule::in($allowedRoles)],
            'nip' => ['nullable', 'string', 'max:30'],
            'jenis_kelamin' => ['nullable', Rule::in(['L', 'P'])],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'module_access' => ['nullable', 'array'],
            'module_access.*' => ['string'],
            'foto' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
