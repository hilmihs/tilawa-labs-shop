<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminPaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;

class PaymentMethodController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => PaymentMethod::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function update(AdminPaymentMethodRequest $request, PaymentMethod $payment_method): JsonResponse
    {
        $payment_method->update($request->validated());

        return response()->json(['data' => $payment_method->refresh()]);
    }
}
