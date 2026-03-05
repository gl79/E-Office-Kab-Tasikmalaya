<?php

namespace App\Http\Requests\Persuratan;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi request untuk disposisi surat masuk ke pejabat bawahan.
 */
class DisposisiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'ke_user_id' => ['required', 'integer', 'exists:users,id'],
            'catatan' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'ke_user_id.required' => 'Penerima disposisi wajib dipilih.',
            'ke_user_id.exists' => 'Penerima disposisi tidak valid.',
            'catatan.max' => 'Catatan disposisi maksimal 2000 karakter.',
        ];
    }
}
