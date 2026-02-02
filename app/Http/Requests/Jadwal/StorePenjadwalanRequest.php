<?php

namespace App\Http\Requests\Jadwal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePenjadwalanRequest extends FormRequest
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
        return [
            'surat_masuk_id' => 'required|exists:surat_masuks,id',
            'nama_kegiatan' => 'required|string|max:255',
            'tanggal_agenda' => 'required|date|after_or_equal:today',
            'waktu_mulai' => 'required|date_format:H:i',
            'waktu_selesai' => 'nullable|date_format:H:i|after:waktu_mulai',
            'sampai_selesai' => 'boolean',
            'lokasi_type' => 'required|in:dalam_daerah,luar_daerah',
            'kode_wilayah' => 'nullable|string|max:20',
            'tempat' => 'required|string|max:500',
            'keterangan' => 'nullable|string',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'surat_masuk_id.required' => 'Surat masuk wajib dipilih.',
            'surat_masuk_id.exists' => 'Surat masuk tidak ditemukan.',
            'nama_kegiatan.required' => 'Nama kegiatan wajib diisi.',
            'nama_kegiatan.max' => 'Nama kegiatan maksimal 255 karakter.',
            'tanggal_agenda.required' => 'Tanggal agenda wajib diisi.',
            'tanggal_agenda.date' => 'Format tanggal tidak valid.',
            'tanggal_agenda.after_or_equal' => 'Tanggal agenda tidak boleh kurang dari hari ini.',
            'waktu_mulai.required' => 'Waktu mulai wajib diisi.',
            'waktu_mulai.date_format' => 'Format waktu mulai tidak valid (HH:MM).',
            'waktu_selesai.date_format' => 'Format waktu selesai tidak valid (HH:MM).',
            'waktu_selesai.after' => 'Waktu selesai harus setelah waktu mulai.',
            'lokasi_type.required' => 'Tipe lokasi wajib dipilih.',
            'lokasi_type.in' => 'Tipe lokasi tidak valid.',
            'tempat.required' => 'Tempat wajib diisi.',
            'tempat.max' => 'Tempat maksimal 500 karakter.',
        ];
    }

    /**
     * Additional validation after standard validation
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $sampaiSelesai = $this->boolean('sampai_selesai');
            $waktuSelesai = $this->input('waktu_selesai');
            $lokasiType = $this->input('lokasi_type');
            $kodeWilayah = $this->input('kode_wilayah');

            // Validasi waktu selesai vs sampai selesai
            if ($sampaiSelesai && $waktuSelesai) {
                $validator->errors()->add(
                    'waktu_selesai',
                    'Waktu selesai tidak boleh diisi jika "Sampai Selesai" dicentang.'
                );
            }

            if (!$sampaiSelesai && !$waktuSelesai) {
                $validator->errors()->add(
                    'waktu_selesai',
                    'Waktu selesai wajib diisi jika "Sampai Selesai" tidak dicentang.'
                );
            }

            // Validasi kode wilayah untuk dalam daerah
            if ($lokasiType === 'dalam_daerah' && empty($kodeWilayah)) {
                $validator->errors()->add(
                    'kode_wilayah',
                    'Kode wilayah wajib dipilih untuk lokasi dalam daerah.'
                );
            }
        });
    }

    /**
     * Prepare the data for validation
     */
    protected function prepareForValidation(): void
    {
        // Convert sampai_selesai to boolean if it's a string
        if ($this->has('sampai_selesai')) {
            $this->merge([
                'sampai_selesai' => filter_var($this->sampai_selesai, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        // Clear waktu_selesai if sampai_selesai is true
        if ($this->boolean('sampai_selesai')) {
            $this->merge(['waktu_selesai' => null]);
        }

        // Clear kode_wilayah if lokasi_type is luar_daerah
        if ($this->input('lokasi_type') === 'luar_daerah') {
            $this->merge(['kode_wilayah' => null]);
        }
    }
}
