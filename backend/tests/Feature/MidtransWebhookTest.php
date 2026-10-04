<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MidtransWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_updates_paid_order_once_signature_is_valid(): void
    {
        config(['services.midtrans.server_key' => 'server-key']);

        $order = Order::query()->create([
            'order_number' => 'TN-TEST',
            'customer_name' => 'Buyer',
            'customer_email' => 'buyer@example.com',
            'customer_phone' => '08123',
            'shipping_address' => ['line1' => 'Jl Test'],
            'shipping_provider' => 'rajaongkir',
            'shipping_courier' => 'jne',
            'shipping_service' => 'REG',
            'subtotal' => 100000,
            'shipping_cost' => 10000,
            'total' => 110000,
            'status' => Order::STATUS_PENDING_PAYMENT,
            'payment_status' => 'pending',
        ]);

        $payload = [
            'order_id' => $order->order_number,
            'status_code' => '200',
            'gross_amount' => '110000.00',
            'transaction_status' => 'settlement',
            'transaction_id' => 'tx-1',
        ];
        $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'server-key');

        $this->postJson('/api/v1/payments/midtrans/webhook', $payload)->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => Order::STATUS_PAID,
            'payment_status' => 'paid',
        ]);
    }
}
