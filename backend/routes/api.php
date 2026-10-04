<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PaymentMethodController as AdminPaymentMethodController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\PromotionController as AdminPromotionController;
use App\Http\Controllers\Admin\SellerController as AdminSellerController;
use App\Http\Controllers\Admin\ShippingZoneController as AdminShippingZoneController;
use App\Http\Controllers\Admin\StoreSettingController as AdminStoreSettingController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\MidtransWebhookController;
use App\Http\Controllers\Api\OrderLookupController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ShippingQuoteController;
use App\Http\Controllers\Api\ShippingZoneController;
use App\Http\Controllers\Api\StoreSettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product:slug}', [ProductController::class, 'show']);
    Route::post('/shipping/quote', ShippingQuoteController::class)->middleware('throttle:30,1');
    Route::get('/shipping-zones', ShippingZoneController::class);
    Route::get('/store-settings', StoreSettingController::class);
    Route::post('/checkout', CheckoutController::class)->middleware('throttle:20,1');
    Route::get('/orders/{order:order_number}', OrderLookupController::class);
    Route::post('/payments/midtrans/webhook', MidtransWebhookController::class)->middleware('throttle:120,1');

    Route::prefix('admin')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

        Route::middleware(['auth:sanctum', 'admin'])->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::patch('/me', [AuthController::class, 'updateProfile']);
            Route::patch('/me/password', [AuthController::class, 'updatePassword']);
            Route::apiResource('/products', AdminProductController::class);
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
            Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
            Route::get('/store-settings', [AdminStoreSettingController::class, 'show']);
            Route::match(['post', 'patch'], '/store-settings', [AdminStoreSettingController::class, 'update']);
            Route::apiResource('/shipping-zones', AdminShippingZoneController::class);
            Route::apiResource('/sellers', AdminSellerController::class);
            Route::apiResource('/promotions', AdminPromotionController::class);
            Route::get('/payment-methods', [AdminPaymentMethodController::class, 'index']);
            Route::patch('/payment-methods/{payment_method}', [AdminPaymentMethodController::class, 'update']);
        });
    });
});
