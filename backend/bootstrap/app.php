<?php

use App\Http\Middleware\EnsureAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// On a serverless filesystem only /tmp is writable, and Laravel wants to write
// its caches, compiled views and logs under storage/. Redirect the whole tree.
if (($_ENV['VERCEL'] ?? getenv('VERCEL')) !== false && ($_ENV['VERCEL'] ?? getenv('VERCEL'))) {
    $_ENV['APP_STORAGE_PATH'] = '/tmp/storage';
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => EnsureAdmin::class,
        ]);

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create()
    ->useStoragePath($_ENV['APP_STORAGE_PATH'] ?? base_path('storage'));
