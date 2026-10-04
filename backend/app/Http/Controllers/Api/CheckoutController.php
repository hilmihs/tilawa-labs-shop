<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Services\CartPricingService;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function __invoke(CheckoutRequest $request, CartPricingService $pricing, MidtransService $midtrans): JsonResponse
    {
        $validated = $request->validated();
        $cart = $pricing->calculate($validated['items']);
        $shipping = $validated['shipping_quote'];

        if ((int) $shipping['weight_grams'] !== $cart['weight_grams']) {
            throw ValidationException::withMessages(['shipping_quote' => 'Shipping quote weight no longer matches cart.']);
        }

        $total = $cart['subtotal'] + (int) $shipping['cost'];

        $order = DB::transaction(function () use ($validated, $cart, $shipping, $total): Order {
            $order = Order::query()->create([
                'order_number' => 'TN-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_provider' => $shipping['provider'],
                'shipping_courier' => $shipping['courier'],
                'shipping_service' => $shipping['service'],
                'shipping_description' => $shipping['description'] ?? null,
                'shipping_etd' => $shipping['etd'] ?? null,
                'subtotal' => $cart['subtotal'],
                'shipping_cost' => (int) $shipping['cost'],
                'total' => $total,
                'status' => Order::STATUS_PENDING_PAYMENT,
                'payment_status' => 'pending',
            ]);

            foreach ($cart['lines'] as $line) {
                $product = $line['product'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_slug' => $product->slug,
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'line_total' => $line['line_total'],
                    'weight_grams' => $line['weight_grams'],
                ]);

                $product->decrement('stock', $line['quantity']);
            }

            return $order->load('items');
        });

        $snap = $midtrans->createSnapTransaction($order);
        $payment = $order->payment()->create([
            'provider' => 'midtrans',
            'provider_order_id' => $order->order_number,
            'snap_token' => $snap['snap_token'],
            'snap_redirect_url' => $snap['snap_redirect_url'],
            'gross_amount' => $order->total,
            'transaction_status' => 'pending',
        ]);

        return response()->json([
            'data' => [
                ...$order->only(['id', 'order_number', 'status', 'payment_status', 'subtotal', 'shipping_cost', 'total']),
                'snap_token' => $payment->snap_token,
                'snap_redirect_url' => $payment->snap_redirect_url,
            ],
        ], 201);
    }
}
