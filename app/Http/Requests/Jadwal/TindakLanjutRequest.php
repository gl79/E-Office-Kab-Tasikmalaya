<?php

namespace App\Http\Requests\Jadwal;

use Illuminate\Foundation\Http\FormRequest;

class TindakLanjutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization final ditentukan di Policy/Controller.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tanggal_agenda' => 'required|date',
            'waktu_mulai' => 'required|date_format:H:i',
            'waktu_selesai' => 'nullable|date_format:H:i|after:waktu_mulai',
            'sampai_selesai' => 'boolean',
            'lokasi_type' => 'required|in:dalam_daerah,luar_daerah',
            'provinsi_id' => 'nullable|string',
            'kabupaten_id' => 'nullable|string',
            'kecamatan_id' => 'nullable|string',
            'desa_id' => 'nullable|string',
            'tempat' => 'required|string|max:255',
            'status_kehadiran' => 'required|in:Dihadiri,Diwakilkan,Tidak Dihadiri',
            'nama_yang_mewakili' => 'nullable|string|max:255',
            'jabatan_yang_mewakili' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string|max:2000',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'waktu_mulai.required' => 'Waktu mulai wajib diisi.',
            'waktu_selesai.after' => 'Waktu selesai harus setelah waktu mulai.',
            'lokasi_type.required' => 'Jenis lokasi wajib dipilih.',
            'tempat.required' => 'Tempat kegiatan wajib diisi.',
            'status_kehadiran.required' => 'Status kehadiran wajib dipilih.',
        ];
    }
}
