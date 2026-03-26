<?php

namespace App\Http\Requests\Master\Wilayah;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KecamatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization sudah di Policy
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        // Validasi geo fields (berlaku untuk store & update)
        $geoRules = [
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'alamat' => ['nullable', 'string', 'max:500'],
        ];

        if ($isUpdate) {
            // Untuk update, hanya validasi nama + geo
            return [
                'nama' => ['required', 'string', 'max:255'],
                ...$geoRules,
            ];
        }

        // Untuk store, validasi lengkap
        return [
            'provinsi_kode' => ['required', 'exists:wilayah_provinsi,kode'],
            'kabupaten_kode' => [
                'required',
                Rule::exists('wilayah_kabupaten', 'kode')->where(function ($query) {
                    return $query->where('provinsi_kode', $this->provinsi_kode);
                }),
            ],
            'kode' => [
                'required',
                'string',
                'size:2',
                Rule::unique('wilayah_kecamatan')->where(function ($query) {
                    return $query->where('provinsi_kode', $this->provinsi_kode)
                        ->where('kabupaten_kode', $this->kabupaten_kode);
                }),
            ],
            'nama' => ['required', 'string', 'max:255'],
            ...$geoRules,
        ];
    }

    public function messages(): array
    {
        return [
            'provinsi_kode.required' => 'Provinsi wajib dipilih.',
            'provinsi_kode.exists' => 'Provinsi tidak valid.',
            'kabupaten_kode.required' => 'Kabupaten wajib dipilih.',
            'kabupaten_kode.exists' => 'Kabupaten tidak valid atau tidak sesuai dengan provinsi.',
            'kode.required' => 'Kode kecamatan wajib diisi.',
            'kode.size' => 'Kode kecamatan harus 2 karakter.',
            'kode.unique' => 'Kode kecamatan sudah digunakan dalam kabupaten ini.',
            'nama.required' => 'Nama kecamatan wajib diisi.',
            'nama.max' => 'Nama kecamatan maksimal 255 karakter.',
        ];
    }
}
