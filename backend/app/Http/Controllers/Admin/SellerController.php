<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminSellerRequest;
use App\Models\Seller;
use Illuminate\Http\JsonResponse;

class SellerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Seller::query()->orderBy('name')->get(),
        ]);
    }

    public function store(AdminSellerRequest $request): JsonResponse
    {
        $seller = Seller::query()->create($request->validated());

        return response()->json(['data' => $seller], 201);
    }

    public function show(Seller $seller): JsonResponse
    {
        return response()->json(['data' => $seller]);
    }

    public function update(AdminSellerRequest $request, Seller $seller): JsonResponse
    {
        $seller->update($request->validated());

        return response()->json(['data' => $seller->refresh()]);
    }

    public function destroy(Seller $seller): JsonResponse
    {
        $seller->delete();

        return response()->json(['data' => true]);
    }
}
