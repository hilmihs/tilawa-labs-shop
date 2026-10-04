<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'logo_path',
        'logo_url',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], ['name' => 'Toko Nusa']);
    }
}
