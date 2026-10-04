<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'city',
        'verified',
        'contact_email',
        'contact_phone',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'verified' => 'boolean',
        ];
    }
}
