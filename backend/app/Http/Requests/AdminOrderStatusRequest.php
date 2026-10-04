<?php

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminOrderStatusRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in([
                    Order::STATUS_PENDING_PAYMENT,
                    Order::STATUS_PAID,
                    Order::STATUS_PROCESSING,
                    Order::STATUS_SHIPPED,
                    Order::STATUS_COMPLETED,
                    Order::STATUS_CANCELLED,
                ]),
            ],
        ];
    }
}
