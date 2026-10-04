<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminPromotionRequest extends FormRequest
{
    public function rules(): array
    {
        $promotionId = $this->route('promotion')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:40',
                'regex:/^[A-Z0-9_-]+$/',
                Rule::unique('promotions', 'code')->ignore($promotionId),
            ],
            'name' => ['required', 'string', 'max:160'],
            'type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0'],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'active' => ['boolean'],
        ];
    }

    public function prepareForValidation(): void
    {
        if ($this->has('code')) {
            $this->merge(['code' => strtoupper((string) $this->input('code'))]);
        }
    }
}
