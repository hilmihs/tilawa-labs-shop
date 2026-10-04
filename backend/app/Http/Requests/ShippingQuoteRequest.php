<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShippingQuoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'destination_city_id' => ['required', 'string', 'max:32'],
            'courier' => ['required', 'string', 'in:jne,pos,tiki'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }
}
