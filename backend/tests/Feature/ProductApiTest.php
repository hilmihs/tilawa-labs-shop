<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_listing_returns_active_products(): void
    {
        Product::query()->create([
            'name' => 'Sample Product',
            'slug' => 'sample-product',
            'description' => 'A test product',
            'price' => 100000,
            'stock' => 10,
            'weight_grams' => 500,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'sample-product');
    }
}
