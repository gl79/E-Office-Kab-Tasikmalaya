<?php

namespace App\Http\Requests\Cuti;

use App\Models\Cuti;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCutiRequest extends FormRequest
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
            'user_id' => ['required', 'exists:users,id'],
            'atasan_id' => ['nullable', 'exists:users,id'],
            'jenis_cuti' => ['required', 'string', Rule::in(Cuti::JENIS_CUTI_OPTIONS)],
            'alasan_cuti' => ['required', 'string'],
            'lama_cuti' => ['required', 'integer', 'min:1'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'alamat_cuti' => ['required', 'string'],
        ];
    }
}
