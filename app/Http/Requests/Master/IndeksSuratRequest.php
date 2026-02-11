<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;

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
                    'nama' => ['required', 'string', 'max:255'],
                ];
            }

            // Jika tanpa parent_id: tambah kode primer baru
            return [
                'kode' => ['required', 'string', 'max:10', 'unique:indeks_surat,kode'],
                'nama' => ['required', 'string', 'max:255'],
            ];
        }

        // Update: hanya nama yang bisa diubah
        return [
            'nama' => ['required', 'string', 'max:255'],
        ];
    }
}
