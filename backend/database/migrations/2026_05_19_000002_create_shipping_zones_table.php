<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('shipping_zones', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->string('description', 240)->nullable();
            $table->json('cities');
            $table->unsignedBigInteger('cost');
            $table->string('etd', 16)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_zones');
    }
};
