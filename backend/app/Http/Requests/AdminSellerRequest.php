<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminSellerRequest extends FormRequest
{
    public function rules(): array
    {
        $sellerId = $this->route('seller')?->id;

        return [
            'slug' => [
                'required',
                'string',
                'max:80',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('sellers', 'slug')->ignore($sellerId),
            ],
            'name' => ['required', 'string', 'max:160'],
            'city' => ['required', 'string', 'max:120'],
            'verified' => ['boolean'],
            'contact_email' => ['nullable', 'email', 'max:180'],
            'contact_phone' => ['nullable', 'string', 'max:32'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
