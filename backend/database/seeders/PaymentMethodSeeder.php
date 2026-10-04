<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            ['code' => 'qris', 'label' => 'QRIS', 'type' => 'qris', 'sort_order' => 1],
            ['code' => 'va_bca', 'label' => 'Virtual Account BCA', 'type' => 'va', 'sort_order' => 10],
            ['code' => 'va_mandiri', 'label' => 'Virtual Account Mandiri', 'type' => 'va', 'sort_order' => 11],
            ['code' => 'va_bni', 'label' => 'Virtual Account BNI', 'type' => 'va', 'sort_order' => 12],
            ['code' => 'va_bri', 'label' => 'Virtual Account BRI', 'type' => 'va', 'sort_order' => 13],
            ['code' => 'ewallet_gopay', 'label' => 'GoPay', 'type' => 'ewallet', 'sort_order' => 20],
            ['code' => 'ewallet_ovo', 'label' => 'OVO', 'type' => 'ewallet', 'sort_order' => 21],
            ['code' => 'ewallet_dana', 'label' => 'DANA', 'type' => 'ewallet', 'sort_order' => 22],
            ['code' => 'ewallet_shopeepay', 'label' => 'ShopeePay', 'type' => 'ewallet', 'sort_order' => 23],
            ['code' => 'card', 'label' => 'Credit / Debit Card', 'type' => 'card', 'sort_order' => 30],
        ];

        foreach ($methods as $method) {
            PaymentMethod::query()->updateOrCreate(
                ['code' => $method['code']],
                $method + ['enabled' => true],
            );
        }
    }
}
