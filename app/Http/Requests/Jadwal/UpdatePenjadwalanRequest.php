<?php

namespace App\Http\Requests\Jadwal;

class UpdatePenjadwalanRequest extends StorePenjadwalanRequest
{
    /**
     * Get the validation rules that apply to the request.
     * Extends parent rules but makes surat_masuk_id optional since it can't be changed
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        // surat_masuk_id tidak bisa diubah saat update
        unset($rules['surat_masuk_id']);

        return $rules;
    }
}
