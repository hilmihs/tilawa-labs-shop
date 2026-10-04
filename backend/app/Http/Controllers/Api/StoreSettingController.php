<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;

class StoreSettingController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $s = StoreSetting::current();

        return response()->json([
            'data' => [
                'name' => $s->name,
                'email' => $s->email,
                'phone' => $s->phone,
                'address' => $s->address,
                'logo_url' => $s->logo_url,
            ],
        ]);
    }
}
