<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductRequest extends FormRequest
{
    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', Rule::unique('products', 'slug')->ignore($productId)],
            'description' => ['required', 'string', 'max:5000'],
            'price' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'weight_grams' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
