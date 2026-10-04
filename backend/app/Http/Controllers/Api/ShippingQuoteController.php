<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShippingQuoteRequest;
use App\Services\CartPricingService;
use App\Services\RajaOngkirService;
use Illuminate\Http\JsonResponse;

class ShippingQuoteController extends Controller
{
    public function __invoke(
        ShippingQuoteRequest $request,
        CartPricingService $pricing,
        RajaOngkirService $rajaOngkir
    ): JsonResponse {
        $cart = $pricing->calculate($request->validated('items'));
        $quotes = $rajaOngkir->quote(
            $request->validated('destination_city_id'),
            $request->validated('courier'),
            $cart['weight_grams']
        );

        return response()->json(['data' => $quotes]);
    }
}
