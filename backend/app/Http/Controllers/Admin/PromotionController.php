<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminPromotionRequest;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Promotion::query()->orderByDesc('id')->get(),
        ]);
    }

    public function store(AdminPromotionRequest $request): JsonResponse
    {
        $promotion = Promotion::query()->create($request->validated());

        return response()->json(['data' => $promotion], 201);
    }

    public function show(Promotion $promotion): JsonResponse
    {
        return response()->json(['data' => $promotion]);
    }

    public function update(AdminPromotionRequest $request, Promotion $promotion): JsonResponse
    {
        $promotion->update($request->validated());

        return response()->json(['data' => $promotion->refresh()]);
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        $promotion->delete();

        return response()->json(['data' => true]);
    }
}
