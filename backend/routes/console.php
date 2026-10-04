<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('app:about-storefront', function (): void {
    $this->info('Toko Nusa Laravel API');
})->purpose('Display API application name');
