<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('midtrans');
            $table->string('provider_order_id')->index();
            $table->string('transaction_id')->nullable()->index();
            $table->string('transaction_status')->nullable()->index();
            $table->string('fraud_status')->nullable();
            $table->string('payment_type')->nullable();
            $table->string('snap_token')->nullable();
            $table->text('snap_redirect_url')->nullable();
            $table->unsignedBigInteger('gross_amount');
            $table->json('raw_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->unique(['provider', 'provider_order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
