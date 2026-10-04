<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class OrderLookupController extends Controller
{
    public function __invoke(Order $order): JsonResponse
    {
        $order->load('payment');

        return response()->json([
            'data' => [
                ...$order->only(['id', 'order_number', 'status', 'payment_status', 'subtotal', 'shipping_cost', 'total']),
                'snap_token' => $order->payment?->snap_token,
                'snap_redirect_url' => $order->payment?->snap_redirect_url,
            ],
        ]);
    }
}
