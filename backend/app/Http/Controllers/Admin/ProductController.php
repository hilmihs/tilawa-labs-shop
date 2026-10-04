<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminProductRequest;
use App\Models\Product;
use App\Services\ProductImageUploader;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Product::query()->with('images')->latest()->get(),
        ]);
    }

    public function store(AdminProductRequest $request, ProductImageUploader $uploader): JsonResponse
    {
        $product = DB::transaction(function () use ($request, $uploader): Product {
            $product = Product::query()->create($request->safe()->except('images'));
            $this->syncImages($product, $request->file('images', []), $uploader);

            return $product->load('images');
        });

        return response()->json(['data' => $product], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => $product->load('images')]);
    }

    public function update(AdminProductRequest $request, Product $product, ProductImageUploader $uploader): JsonResponse
    {
        DB::transaction(function () use ($request, $product, $uploader): void {
            $product->update($request->safe()->except('images'));

            if ($request->hasFile('images')) {
                $product->images()->delete();
                $this->syncImages($product, $request->file('images', []), $uploader);
            }
        });

        return response()->json(['data' => $product->refresh()->load('images')]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['data' => true]);
    }

    private function syncImages(Product $product, array $images, ProductImageUploader $uploader): void
    {
        foreach ($images as $index => $image) {
            $uploaded = $uploader->upload($image);
            $product->images()->create([
                ...$uploaded,
                'alt_text' => $product->name,
                'sort_order' => $index,
            ]);
        }
    }
}
