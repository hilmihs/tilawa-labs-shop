<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Everyday Sling Bag',
                'slug' => 'everyday-sling-bag',
                'description' => 'A lightweight sling bag with thoughtful compartments for daily commutes and short trips.',
                'price' => 249000,
                'stock' => 30,
                'weight_grams' => 700,
                'url' => 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1000&q=80',
            ],
            [
                'name' => 'Desk Organizer Set',
                'slug' => 'desk-organizer-set',
                'description' => 'A minimalist desk organizer for pens, cables, and small accessories.',
                'price' => 159000,
                'stock' => 42,
                'weight_grams' => 900,
                'url' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
            ],
            [
                'name' => 'Travel Tumbler',
                'slug' => 'travel-tumbler',
                'description' => '600ml stainless steel tumbler with double-wall insulation for hot and cold drinks on the move.',
                'price' => 189000,
                'stock' => 55,
                'weight_grams' => 500,
                'url' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
            ],
            [
                'name' => 'Linen Throw Blanket',
                'slug' => 'linen-throw-blanket',
                'description' => 'Stone-washed linen blanket woven on traditional looms. Lightweight in summer, layered in winter.',
                'price' => 685000,
                'stock' => 12,
                'weight_grams' => 1200,
                'url' => 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1000&q=80',
            ],
            [
                'name' => 'Ceramic Pour-Over',
                'slug' => 'ceramic-pour-over',
                'description' => 'A hand-thrown ceramic dripper for single-cup pour-over coffee. Holds standard size 02 filters.',
                'price' => 145000,
                'stock' => 24,
                'weight_grams' => 540,
                'url' => 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=80',
            ],
            [
                'name' => 'Rattan Pendant Lamp',
                'slug' => 'rattan-pendant-lamp',
                'description' => 'Hand-bent rattan pendant lamp with warm diffused light. Pairs nicely with reading nooks.',
                'price' => 580000,
                'stock' => 7,
                'weight_grams' => 1400,
                'url' => 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
            ],
            [
                'name' => 'Single Origin Coffee 200g',
                'slug' => 'single-origin-coffee-200g',
                'description' => 'Naturally processed single origin from highland farms. Notes of berries, brown sugar, and dried apricot.',
                'price' => 95000,
                'stock' => 38,
                'weight_grams' => 220,
                'url' => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1000&q=80',
            ],
            [
                'name' => 'Hand-Woven Tote',
                'slug' => 'hand-woven-tote',
                'description' => 'A roomy tote woven by hand from natural pandan leaves. Holds a 14-inch laptop comfortably.',
                'price' => 320000,
                'stock' => 9,
                'weight_grams' => 350,
                'url' => 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=1000&q=80',
            ],
        ];

        foreach ($products as $item) {
            $product = Product::query()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'weight_grams' => $item['weight_grams'],
                    'is_active' => true,
                ]
            );

            $product->images()->updateOrCreate(
                ['sort_order' => 0],
                [
                    'path' => 'seed/'.$item['slug'].'.jpg',
                    'url' => $item['url'],
                    'alt_text' => $item['name'],
                ]
            );
        }
    }
}
