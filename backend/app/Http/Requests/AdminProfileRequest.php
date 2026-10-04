<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProfileRequest extends FormRequest
{
    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:180', Rule::unique('users', 'email')->ignore($userId)],
        ];
    }
}
