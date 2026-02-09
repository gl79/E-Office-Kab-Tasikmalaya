<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class FileService
{
    /**
     * Store uploaded file and return path.
     *
     * @param UploadedFile $file The uploaded file
     * @param string $directory The storage directory (relative to public disk)
     * @return string The stored file path
     */
    public static function store(UploadedFile $file, string $directory): string
    {
        $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
        return $file->storeAs($directory, $filename, 'public');
    }
}
