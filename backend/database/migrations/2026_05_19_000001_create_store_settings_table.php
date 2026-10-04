<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->default('Toko Nusa');
            $table->string('email')->nullable();
            $table->string('phone', 32)->nullable();
            $table->string('address', 500)->nullable();
            $table->string('logo_path')->nullable();
            $table->text('logo_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
