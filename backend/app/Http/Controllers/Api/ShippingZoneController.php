<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use Illuminate\Http\JsonResponse;

class ShippingZoneController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => ShippingZone::query()
                ->active()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        ]);
    }
}
