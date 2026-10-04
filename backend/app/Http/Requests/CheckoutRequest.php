<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_email' => ['required', 'email', 'max:180'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.line1' => ['required', 'string', 'max:240'],
            'shipping_address.line2' => ['nullable', 'string', 'max:240'],
            'shipping_address.city' => ['required', 'string', 'max:120'],
            'shipping_address.province' => ['required', 'string', 'max:120'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.destination_city_id' => ['required', 'string', 'max:32'],
            'shipping_quote' => ['required', 'array'],
            'shipping_quote.provider' => ['required', 'string', 'in:rajaongkir'],
            'shipping_quote.courier' => ['required', 'string', 'in:jne,pos,tiki'],
            'shipping_quote.service' => ['required', 'string', 'max:80'],
            'shipping_quote.description' => ['nullable', 'string', 'max:180'],
            'shipping_quote.cost' => ['required', 'integer', 'min:0'],
            'shipping_quote.etd' => ['nullable', 'string', 'max:80'],
            'shipping_quote.origin_city_id' => ['required', 'string', 'max:32'],
            'shipping_quote.destination_city_id' => ['required', 'string', 'max:32'],
            'shipping_quote.weight_grams' => ['required', 'integer', 'min:1'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }
}
