<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminShippingZoneRequest;
use App\Models\ShippingZone;
use Illuminate\Http\JsonResponse;

class ShippingZoneController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => ShippingZone::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(AdminShippingZoneRequest $request): JsonResponse
    {
        $zone = ShippingZone::query()->create($request->validated());

        return response()->json(['data' => $zone], 201);
    }

    public function show(ShippingZone $shipping_zone): JsonResponse
    {
        return response()->json(['data' => $shipping_zone]);
    }

    public function update(AdminShippingZoneRequest $request, ShippingZone $shipping_zone): JsonResponse
    {
        $shipping_zone->update($request->validated());

        return response()->json(['data' => $shipping_zone->refresh()]);
    }

    public function destroy(ShippingZone $shipping_zone): JsonResponse
    {
        $shipping_zone->delete();

        return response()->json(['data' => true]);
    }
}
