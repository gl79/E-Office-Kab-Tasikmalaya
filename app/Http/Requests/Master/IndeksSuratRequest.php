<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndeksSuratRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->isMethod('POST')) {
            // Jika parent_id diisi: tambah sub-kode
            if ($this->filled('parent_id')) {
                return [
                    'parent_id' => ['required', 'string', 'exists:indeks_surat,id'],
                    'nama' => ['required', 'string', 'max:1000'],
                ];
            }

            // Jika tanpa parent_id: tambah kode primer baru
            return [
                'kode' => ['required', 'string', 'max:50', 'regex:/^[0-9]+(\.[0-9]+)*$/', 'unique:indeks_surat,kode'],
                'nama' => ['required', 'string', 'max:1000'],
            ];
        }

        // Update
        $rules = [
            'nama' => ['required', 'string', 'max:1000'],
        ];

        // Jika kode diisi saat update, validasi format & uniqueness
        if ($this->filled('kode')) {
            $rules['kode'] = [
                'required',
                'string',
                'max:50',
                'regex:/^[0-9]+(\.[0-9]+)*$/',
                Rule::unique('indeks_surat', 'kode')->ignore($this->route('indeks_surat')),
            ];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'kode.regex' => 'Format kode tidak valid. Gunakan format angka dipisahkan titik (contoh: 000, 000.1, 000.1.1).',
            'kode.unique' => 'Kode klasifikasi sudah digunakan.',
        ];
    }
}
