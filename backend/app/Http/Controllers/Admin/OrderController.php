<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminOrderStatusRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Order::query()->latest()->limit(100)->get(),
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json(['data' => $order->load(['items', 'payment'])]);
    }

    public function updateStatus(AdminOrderStatusRequest $request, Order $order): JsonResponse
    {
        $status = $request->validated('status');

        if ($status !== $order->status && ! $order->canTransitionTo($status)) {
            throw ValidationException::withMessages(['status' => 'Invalid order status transition.']);
        }

        $order->update(['status' => $status]);

        return response()->json(['data' => $order->refresh()]);
    }
}
