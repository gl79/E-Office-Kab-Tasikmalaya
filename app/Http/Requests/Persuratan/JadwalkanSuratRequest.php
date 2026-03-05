<?php

namespace App\Http\Requests\Persuratan;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi request untuk menjadwalkan surat masuk sebagai kegiatan tentatif.
 */
class JadwalkanSuratRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'judul_kegiatan' => ['required', 'string', 'max:500'],
            'tanggal' => ['required', 'date'],
            'waktu_mulai' => ['required', 'date_format:H:i'],
            'waktu_selesai' => ['nullable', 'date_format:H:i', 'after:waktu_mulai'],
            'sampai_selesai' => ['nullable', 'boolean'],
            'lokasi' => ['required', 'string', 'max:500'],
            'lokasi_type' => ['nullable', 'string', 'in:dalam_daerah,luar_daerah'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'judul_kegiatan.required' => 'Judul kegiatan wajib diisi.',
            'tanggal.required' => 'Tanggal kegiatan wajib diisi.',
            'waktu_mulai.required' => 'Waktu mulai wajib diisi.',
            'waktu_mulai.date_format' => 'Format waktu mulai harus HH:MM.',
            'waktu_selesai.date_format' => 'Format waktu selesai harus HH:MM.',
            'waktu_selesai.after' => 'Waktu selesai harus setelah waktu mulai.',
            'lokasi.required' => 'Lokasi kegiatan wajib diisi.',
        ];
    }
}
