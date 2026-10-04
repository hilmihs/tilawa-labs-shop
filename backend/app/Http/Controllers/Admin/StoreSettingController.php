<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSettingRequest;
use App\Models\StoreSetting;
use App\Services\ProductImageUploader;
use Illuminate\Http\JsonResponse;

class StoreSettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->present(StoreSetting::current())]);
    }

    public function update(StoreSettingRequest $request, ProductImageUploader $uploader): JsonResponse
    {
        $settings = StoreSetting::current();

        $payload = $request->safe()->except('logo');

        if ($request->hasFile('logo')) {
            $uploaded = $uploader->upload($request->file('logo'));
            $payload['logo_path'] = $uploaded['path'];
            $payload['logo_url'] = $uploaded['url'];
        }

        $settings->update($payload);

        return response()->json(['data' => $this->present($settings->refresh())]);
    }

    private function present(StoreSetting $s): array
    {
        return [
            'id' => $s->id,
            'name' => $s->name,
            'email' => $s->email,
            'phone' => $s->phone,
            'address' => $s->address,
            'logo_url' => $s->logo_url,
        ];
    }
}
