<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    public const STATUS_PENDING_PAYMENT = 'pending_payment';
    public const STATUS_PAID = 'paid';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_SHIPPED = 'shipped';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'shipping_provider',
        'shipping_courier',
        'shipping_service',
        'shipping_description',
        'shipping_etd',
        'subtotal',
        'shipping_cost',
        'total',
        'status',
        'payment_status',
    ];

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'subtotal' => 'integer',
            'shipping_cost' => 'integer',
            'total' => 'integer',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function canTransitionTo(string $status): bool
    {
        $allowed = [
            self::STATUS_PENDING_PAYMENT => [self::STATUS_PAID, self::STATUS_CANCELLED],
            self::STATUS_PAID => [self::STATUS_PROCESSING, self::STATUS_CANCELLED],
            self::STATUS_PROCESSING => [self::STATUS_SHIPPED, self::STATUS_CANCELLED],
            self::STATUS_SHIPPED => [self::STATUS_COMPLETED],
            self::STATUS_COMPLETED => [],
            self::STATUS_CANCELLED => [],
        ];

        return in_array($status, $allowed[$this->status] ?? [], true);
    }
}
