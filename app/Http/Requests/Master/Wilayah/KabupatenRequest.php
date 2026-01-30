<?php

namespace App\Http\Requests\Master\Wilayah;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KabupatenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization sudah di Policy
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        $rules = [
            'provinsi_kode' => ['required', 'exists:wilayah_provinsi,kode'],
            'nama' => ['required', 'string', 'max:255'],
        ];

        if ($isUpdate) {
            // Untuk update, hanya validasi nama
            return [
                'nama' => ['required', 'string', 'max:255'],
            ];
        }

        // Untuk store, validasi kode dengan unique constraint
        $rules['kode'] = [
            'required',
            'string',
            'size:2',
            Rule::unique('wilayah_kabupaten')->where(function ($query) {
                return $query->where('provinsi_kode', $this->provinsi_kode);
            }),
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'provinsi_kode.required' => 'Provinsi wajib dipilih.',
            'provinsi_kode.exists' => 'Provinsi tidak valid.',
            'kode.required' => 'Kode kabupaten wajib diisi.',
            'kode.size' => 'Kode kabupaten harus 2 karakter.',
            'kode.unique' => 'Kode kabupaten sudah digunakan dalam provinsi ini.',
            'nama.required' => 'Nama kabupaten wajib diisi.',
            'nama.max' => 'Nama kabupaten maksimal 255 karakter.',
        ];
    }
}
