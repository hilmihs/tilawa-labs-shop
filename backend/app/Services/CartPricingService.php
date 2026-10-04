<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CartPricingService
{
    public function calculate(array $items): array
    {
        $quantities = collect($items)
            ->groupBy('product_id')
            ->map(fn (Collection $rows): int => $rows->sum('quantity'));

        $products = Product::query()
            ->active()
            ->with('images')
            ->whereIn('id', $quantities->keys())
            ->get()
            ->keyBy('id');

        if ($products->count() !== $quantities->count()) {
            throw ValidationException::withMessages([
                'items' => 'One or more products are unavailable.',
            ]);
        }

        $lines = $quantities->map(function (int $quantity, int $productId) use ($products): array {
            /** @var Product $product */
            $product = $products->get($productId);

            if ($quantity > $product->stock) {
                throw ValidationException::withMessages([
                    'items' => "Insufficient stock for {$product->name}.",
                ]);
            }

            return [
                'product' => $product,
                'quantity' => $quantity,
                'unit_price' => $product->price,
                'line_total' => $product->price * $quantity,
                'weight_grams' => $product->weight_grams * $quantity,
            ];
        })->values();

        return [
            'lines' => $lines,
            'subtotal' => $lines->sum('line_total'),
            'weight_grams' => max(1, $lines->sum('weight_grams')),
        ];
    }
}
