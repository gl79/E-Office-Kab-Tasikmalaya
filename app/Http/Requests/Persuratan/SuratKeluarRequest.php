<?php

namespace App\Http\Requests\Persuratan;

use App\Models\SuratKeluar;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SuratKeluarRequest extends FormRequest
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
        $suratKeluarId = $this->route('surat_keluar');

        return [
            'tanggal_surat' => ['required', 'date'],
            'no_urut' => ['required', 'string', 'max:50'],
            'nomor_surat' => [
                'required',
                'string',
                'max:100',
                Rule::unique('surat_keluars', 'nomor_surat')->ignore($suratKeluarId),
            ],
            'kepada' => ['required', 'string', 'max:255'],
            'perihal' => ['required', 'string'],
            'isi_ringkas' => ['required', 'string'],
            'sifat_1' => ['required', 'string', Rule::in(array_keys(SuratKeluar::SIFAT_1_OPTIONS))],
            'sifat_2' => ['required', 'string', Rule::in(array_keys(SuratKeluar::SIFAT_2_OPTIONS))],
            'indeks_id' => ['nullable', 'string', 'exists:indeks_surat,id'],
            'kode_klasifikasi_id' => ['nullable', 'string', 'exists:indeks_surat,id'],
            'unit_kerja_id' => ['nullable', 'string', 'exists:unit_kerja,id'],
            'kode_pengolah' => ['nullable', 'string', 'max:50'],
            'lampiran' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string'],

            // File Upload
            'file' => [
                $this->isMethod('POST') ? 'required' : 'nullable',
                'file',
                'mimes:pdf,doc,docx',
                'max:5120', // 5MB
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'tanggal_surat' => 'Tanggal Surat',
            'no_urut' => 'No Urut',
            'nomor_surat' => 'Nomor Surat',
            'kepada' => 'Kepada (Tujuan Surat)',
            'perihal' => 'Perihal',
            'isi_ringkas' => 'Isi Ringkas Surat',
            'sifat_1' => 'Sifat 1',
            'sifat_2' => 'Sifat 2',
            'indeks_id' => 'Indeks',
            'kode_klasifikasi_id' => 'Kode Klasifikasi',
            'unit_kerja_id' => 'Unit Kerja/Pengolah',
            'kode_pengolah' => 'Kode Pengolah',
            'lampiran' => 'Lampiran',
            'catatan' => 'Catatan',
            'file' => 'File Surat Digital',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nomor_surat.unique' => 'Nomor Surat sudah digunakan.',
            'file.required' => 'File Surat Digital wajib diupload.',
            'file.mimes' => 'File harus berformat PDF, DOC, atau DOCX.',
            'file.max' => 'Ukuran file maksimal 5MB.',
        ];
    }
}
