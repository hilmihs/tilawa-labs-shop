<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminShippingZoneRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:240'],
            'cities' => ['required', 'array', 'min:1'],
            'cities.*' => ['string', 'max:80'],
            'cost' => ['required', 'integer', 'min:0'],
            'etd' => ['nullable', 'string', 'max:16'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
