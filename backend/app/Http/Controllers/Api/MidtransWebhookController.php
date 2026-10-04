<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function __invoke(Request $request, MidtransService $midtrans): JsonResponse
    {
        $payload = $request->all();

        if (! $midtrans->validSignature($payload)) {
            Log::warning('Invalid Midtrans webhook signature', ['order_id' => $payload['order_id'] ?? null]);
            abort(403, 'Invalid signature.');
        }

        $order = Order::query()->where('order_number', $payload['order_id'] ?? null)->firstOrFail();
        $grossAmount = (int) round((float) ($payload['gross_amount'] ?? 0));

        if ($grossAmount !== $order->total) {
            Log::warning('Midtrans webhook amount mismatch', [
                'order_id' => $order->order_number,
                'expected' => $order->total,
                'received' => $payload['gross_amount'] ?? null,
            ]);
            abort(422, 'Gross amount mismatch.');
        }

        DB::transaction(function () use ($order, $payload): void {
            $transactionStatus = $payload['transaction_status'] ?? 'unknown';
            $fraudStatus = $payload['fraud_status'] ?? null;

            $paymentStatus = match ($transactionStatus) {
                'capture' => $fraudStatus === 'challenge' ? 'challenge' : 'paid',
                'settlement' => 'paid',
                'pending' => 'pending',
                'deny', 'cancel' => 'failed',
                'expire' => 'expired',
                default => $order->payment_status,
            };

            $order->payment()->updateOrCreate(
                ['provider_order_id' => $order->order_number, 'provider' => 'midtrans'],
                [
                    'transaction_id' => $payload['transaction_id'] ?? null,
                    'transaction_status' => $transactionStatus,
                    'fraud_status' => $fraudStatus,
                    'payment_type' => $payload['payment_type'] ?? null,
                    'gross_amount' => $order->total,
                    'raw_payload' => $payload,
                    'paid_at' => $paymentStatus === 'paid' ? now() : $order->payment?->paid_at,
                ]
            );

            $nextOrderStatus = match ($paymentStatus) {
                'paid' => Order::STATUS_PAID,
                'failed', 'expired' => Order::STATUS_CANCELLED,
                default => $order->status,
            };

            if ($order->payment_status !== $paymentStatus || $order->status !== $nextOrderStatus) {
                $order->forceFill([
                    'payment_status' => $paymentStatus,
                    'status' => $nextOrderStatus,
                ])->save();
            }
        });

        return response()->json(['received' => true]);
    }
}
