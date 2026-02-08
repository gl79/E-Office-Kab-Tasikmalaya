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
        return [
            'kode' => [
                'required',
                'string',
                'max:50',
                Rule::unique('indeks_surat', 'kode')->ignore($this->route('indeks_surat') ?? $this->id)
            ],
            'nama' => ['required', 'string', 'max:255'],
            'jenis_surat' => ['nullable', 'string', 'max:50'],
        ];
    }
}
