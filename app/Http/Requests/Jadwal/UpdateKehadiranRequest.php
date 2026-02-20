<?php

namespace App\Http\Requests\Jadwal;

use App\Models\Penjadwalan;
use Illuminate\Foundation\Http\FormRequest;

class UpdateKehadiranRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Hanya creator yang bisa edit kehadiran
     */
    public function authorize(): bool
    {
        $penjadwalan = Penjadwalan::find($this->route('id'));

        if (!$penjadwalan) {
            return false;
        }

        return $penjadwalan->created_by === \Illuminate\Support\Facades\Auth::id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'dihadiri_oleh' => 'nullable|integer|exists:users,id',
            'dihadiri_oleh_custom' => 'nullable|string|max:255',
            'status_disposisi' => 'required|in:menunggu,bupati,wakil_bupati,diwakilkan',
            'keterangan' => 'nullable|string',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'status_disposisi.required' => 'Status disposisi wajib dipilih.',
            'status_disposisi.in' => 'Status disposisi tidak valid.',
            'dihadiri_oleh.integer' => 'Pilihan Dihadiri Oleh tidak valid.',
            'dihadiri_oleh.exists' => 'Pengguna Dihadiri Oleh tidak ditemukan.',
            'dihadiri_oleh_custom.max' => 'Input manual Dihadiri Oleh maksimal 255 karakter.',
        ];
    }
}
