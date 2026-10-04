<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_email')->index();
            $table->string('customer_phone');
            $table->json('shipping_address');
            $table->string('shipping_provider');
            $table->string('shipping_courier');
            $table->string('shipping_service');
            $table->string('shipping_description')->nullable();
            $table->string('shipping_etd')->nullable();
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('shipping_cost');
            $table->unsignedBigInteger('total');
            $table->string('status')->default('pending_payment')->index();
            $table->string('payment_status')->default('pending')->index();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('product_slug');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('unit_price');
            $table->unsignedBigInteger('line_total');
            $table->unsignedInteger('weight_grams');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
