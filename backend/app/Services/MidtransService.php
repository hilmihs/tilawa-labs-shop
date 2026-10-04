<?php

namespace App\Services;

use App\Models\Order;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = (bool) config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function createSnapTransaction(Order $order): array
    {
        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => $order->total,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name,
                'email' => $order->customer_email,
                'phone' => $order->customer_phone,
            ],
            'item_details' => $order->items->map(fn ($item): array => [
                'id' => (string) $item->product_id,
                'price' => $item->unit_price,
                'quantity' => $item->quantity,
                'name' => $item->product_name,
            ])->push([
                'id' => 'shipping',
                'price' => $order->shipping_cost,
                'quantity' => 1,
                'name' => 'Shipping',
            ])->values()->all(),
        ];

        $transaction = Snap::createTransaction($payload);

        return [
            'snap_token' => $transaction->token,
            'snap_redirect_url' => $transaction->redirect_url,
        ];
    }

    public function validSignature(array $payload): bool
    {
        $expected = hash('sha512',
            ($payload['order_id'] ?? '').
            ($payload['status_code'] ?? '').
            ($payload['gross_amount'] ?? '').
            config('services.midtrans.server_key')
        );

        return hash_equals($expected, (string) ($payload['signature_key'] ?? ''));
    }
}
