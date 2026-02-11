<?php

namespace App\Http\Requests\Persuratan;

use App\Models\SuratMasuk;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SuratMasukRequest extends FormRequest
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
        $suratMasukId = $this->route('surat_masuk');

        return [
            // Step 1: Identitas Surat
            'tanggal_surat' => ['required', 'date'],
            'asal_surat' => ['required', 'string', 'max:255'],
            'tujuan' => ['required', 'array', 'min:1'],
            'tujuan.*' => ['required', 'string', 'exists:users,id'],
            'nomor_surat' => [
                'required',
                'string',
                'max:100',
                Rule::unique('surat_masuks', 'nomor_surat')->ignore($suratMasukId),
            ],
            'sifat' => ['required', 'string', 'max:50'],
            'lampiran' => ['nullable', 'integer', 'min:0'],
            'perihal' => ['required', 'string'],
            'isi_ringkas' => ['required', 'string'],

            // Step 2: Identitas Agenda
            'tanggal_diterima' => ['required', 'date'],
            'nomor_agenda' => array_filter([
                $this->isMethod('PUT') ? 'required' : null,
                'nullable',
                'string',
                'max:50',
                Rule::unique('surat_masuks', 'nomor_agenda')->ignore($suratMasukId),
            ]),
            'indeks_berkas_id' => ['nullable', 'string', 'exists:indeks_surat,id'],
            'indeks_berkas_custom' => ['nullable', 'string', 'max:255'],
            'kode_klasifikasi_id' => ['nullable', 'string', 'exists:indeks_surat,id'],
            'staff_pengolah_id' => ['nullable', 'string', 'exists:users,id'],
            'tanggal_diteruskan' => ['nullable', 'date'],
            'catatan_tambahan' => ['nullable', 'string'],

            // File Upload
            'file' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg',
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
            'asal_surat' => 'Asal Surat',
            'tujuan' => 'Kepada (Tujuan Surat)',
            'tujuan.*' => 'Tujuan Surat',
            'nomor_surat' => 'Nomor Surat',
            'sifat' => 'Sifat Surat',
            'lampiran' => 'Lampiran',
            'perihal' => 'Perihal',
            'isi_ringkas' => 'Isi Ringkas Surat',
            'tanggal_diterima' => 'Tanggal Diterima',
            'nomor_agenda' => 'Nomor Agenda',
            'indeks_berkas_id' => 'Indeks Berkas',
            'indeks_berkas_custom' => 'Indeks Berkas (Custom)',
            'kode_klasifikasi_id' => 'Kode Klasifikasi',
            'staff_pengolah_id' => 'Staff Pengolah',
            'tanggal_diteruskan' => 'Tanggal Diteruskan',
            'catatan_tambahan' => 'Catatan Tambahan',
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
            'nomor_agenda.unique' => 'Nomor Agenda sudah digunakan.',
            'tujuan.required' => 'Minimal pilih satu tujuan surat.',
            'tujuan.min' => 'Minimal pilih satu tujuan surat.',
            'file.required' => 'File Surat Digital wajib diupload.',
            'file.mimes' => 'File harus berformat PDF, DOC, DOCX, JPG, atau JPEG.',
            'file.max' => 'Ukuran file maksimal 5MB.',
        ];
    }
}
