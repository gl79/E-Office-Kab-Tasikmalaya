<?php

namespace App\Http\Requests\Master\Wilayah;

use Illuminate\Foundation\Http\FormRequest;

class ProvinsiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization sudah di Policy
    }

    public function rules(): array
    {
        $rules = [
            'kode' => ['required', 'string', 'size:2'],
            'nama' => ['required', 'string', 'max:255'],
        ];

        // Untuk update, kode harus unique kecuali record saat ini
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['kode'][] = 'unique:wilayah_provinsi,kode,' . $this->route('provinsi') . ',kode';
        } else {
            $rules['kode'][] = 'unique:wilayah_provinsi,kode';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'kode.required' => 'Kode provinsi wajib diisi.',
            'kode.size' => 'Kode provinsi harus 2 karakter.',
            'kode.unique' => 'Kode provinsi sudah digunakan.',
            'nama.required' => 'Nama provinsi wajib diisi.',
            'nama.max' => 'Nama provinsi maksimal 255 karakter.',
        ];
    }
}
