<?php

namespace App\Http\Requests\Jadwal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class BupatiJadwalRequest extends FormRequest
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
            'dihadiri_oleh_user_id' => ['required', 'integer', 'exists:users,id'],
            'tanggal_agenda' => ['required', 'date'],
            'waktu_mulai' => ['required', 'date_format:H:i'],
            'waktu_selesai' => ['nullable', 'date_format:H:i', 'after:waktu_mulai'],
            'sampai_selesai' => ['nullable', 'boolean'],
            'lokasi_type' => ['required', 'in:dalam_daerah,luar_daerah'],
            'provinsi_id' => ['nullable', 'string', 'max:2'],
            'kabupaten_id' => ['nullable', 'string', 'max:2'],
            'kecamatan_id' => ['nullable', 'string', 'max:2'],
            'desa_id' => ['nullable', 'string', 'max:4'],
            'tempat' => ['required', 'string', 'max:500'],
            'keterangan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'dihadiri_oleh_user_id.required' => 'Field Dihadiri Oleh wajib dipilih.',
            'dihadiri_oleh_user_id.exists' => 'Pengguna yang dipilih tidak ditemukan.',
            'tanggal_agenda.required' => 'Tanggal wajib diisi.',
            'waktu_mulai.required' => 'Waktu mulai wajib diisi.',
            'waktu_selesai.after' => 'Waktu selesai harus setelah waktu mulai.',
            'lokasi_type.required' => 'Tipe lokasi wajib dipilih.',
            'tempat.required' => 'Tempat wajib diisi.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $lokasiType = $this->input('lokasi_type');
            $isOpenEnd = $this->boolean('sampai_selesai');
            $waktuSelesai = $this->input('waktu_selesai');

            if ($isOpenEnd && $waktuSelesai) {
                $validator->errors()->add('waktu_selesai', 'Waktu selesai tidak boleh diisi jika Sampai Selesai dipilih.');
            }

            if (!$isOpenEnd && !$waktuSelesai) {
                $validator->errors()->add('waktu_selesai', 'Waktu selesai wajib diisi jika Sampai Selesai tidak dipilih.');
            }

            if ($lokasiType === 'dalam_daerah') {
                if (!$this->filled('kecamatan_id')) {
                    $validator->errors()->add('kecamatan_id', 'Kecamatan wajib dipilih untuk lokasi dalam daerah.');
                }
                if (!$this->filled('desa_id')) {
                    $validator->errors()->add('desa_id', 'Desa wajib dipilih untuk lokasi dalam daerah.');
                }
            }

            if ($lokasiType === 'luar_daerah') {
                if (!$this->filled('provinsi_id')) {
                    $validator->errors()->add('provinsi_id', 'Provinsi wajib dipilih untuk lokasi luar daerah.');
                }
                if (!$this->filled('kabupaten_id')) {
                    $validator->errors()->add('kabupaten_id', 'Kabupaten wajib dipilih untuk lokasi luar daerah.');
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('sampai_selesai')) {
            $this->merge([
                'sampai_selesai' => filter_var($this->input('sampai_selesai'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        if ($this->boolean('sampai_selesai')) {
            $this->merge(['waktu_selesai' => null]);
        }
    }
}

