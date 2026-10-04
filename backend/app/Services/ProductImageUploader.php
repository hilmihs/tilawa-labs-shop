<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageUploader
{
    public function upload(UploadedFile $file): array
    {
        $extension = $file->getClientOriginalExtension();
        $path = 'products/'.Str::uuid().'.'.$extension;

        Storage::disk(config('filesystems.default'))->put($path, file_get_contents($file->getRealPath()), 'public');

        $publicUrl = rtrim((string) config('services.r2.public_url'), '/');

        return [
            'path' => $path,
            'url' => $publicUrl ? $publicUrl.'/'.$path : Storage::disk(config('filesystems.default'))->url($path),
        ];
    }
}
