<?php

namespace App\Http\Requests\Master\Wilayah;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DesaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization sudah di Policy
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        if ($isUpdate) {
            // Untuk update, hanya validasi nama
            return [
                'nama' => ['required', 'string', 'max:255'],
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
            'kecamatan_kode' => [
                'required',
                Rule::exists('wilayah_kecamatan', 'kode')->where(function ($query) {
                    return $query->where('provinsi_kode', $this->provinsi_kode)
                        ->where('kabupaten_kode', $this->kabupaten_kode);
                }),
            ],
            'kode' => [
                'required',
                'string',
                'size:4',
                Rule::unique('wilayah_desa')->where(function ($query) {
                    return $query->where('provinsi_kode', $this->provinsi_kode)
                        ->where('kabupaten_kode', $this->kabupaten_kode)
                        ->where('kecamatan_kode', $this->kecamatan_kode);
                }),
            ],
            'nama' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'provinsi_kode.required' => 'Provinsi wajib dipilih.',
            'provinsi_kode.exists' => 'Provinsi tidak valid.',
            'kabupaten_kode.required' => 'Kabupaten wajib dipilih.',
            'kabupaten_kode.exists' => 'Kabupaten tidak valid atau tidak sesuai dengan provinsi.',
            'kecamatan_kode.required' => 'Kecamatan wajib dipilih.',
            'kecamatan_kode.exists' => 'Kecamatan tidak valid atau tidak sesuai dengan kabupaten.',
            'kode.required' => 'Kode desa wajib diisi.',
            'kode.size' => 'Kode desa harus 4 karakter.',
            'kode.unique' => 'Kode desa sudah digunakan dalam kecamatan ini.',
            'nama.required' => 'Nama desa wajib diisi.',
            'nama.max' => 'Nama desa maksimal 255 karakter.',
        ];
    }
}
