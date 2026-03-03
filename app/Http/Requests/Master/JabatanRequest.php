<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class JabatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User|null $user */
        $user = Auth::user();
        return $user && $user->isSuperAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
        $jabatan = $this->route('jabatan');

        $rules = [
            'nama' => [
                'required',
                'string',
                'max:255',
                $isUpdate
                    ? Rule::unique('jabatans')->ignore($jabatan?->id)
                    : 'unique:jabatans,nama',
            ],
            'level' => ['required', 'integer', 'min:1'],
            'can_dispose' => ['boolean'],
        ];

        return $rules;
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama jabatan wajib diisi.',
            'nama.unique' => 'Nama jabatan sudah digunakan.',
            'level.required' => 'Level jabatan wajib diisi.',
            'level.integer' => 'Level jabatan harus berupa angka.',
            'level.min' => 'Level jabatan minimal 1.',
        ];
    }

    /**
     * Validasi tambahan setelah rules dasar.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $level = (int) $this->input('level');

            // Level 1 hanya boleh satu jabatan
            if ($level === 1) {
                $query = Jabatan::where('level', 1);

                $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
                if ($isUpdate && $this->route('jabatan')) {
                    $query->where('id', '!=', $this->route('jabatan')->id);
                }

                if ($query->exists()) {
                    $validator->errors()->add('level', 'Hanya boleh ada satu jabatan dengan level 1 (tertinggi).');
                }
            }
        });
    }
}
