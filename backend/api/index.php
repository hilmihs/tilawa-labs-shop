<?php
/**
 * Serverless entrypoint.
 *
 * Laravel writes caches, compiled views, sessions and logs to disk. A
 * serverless filesystem is read-only except for /tmp, so every one of those
 * paths is redirected there before the framework boots — see vercel.json for
 * the cache paths, which have to be environment variables because they are
 * read before the application object exists.
 */
foreach (['framework/views', 'framework/cache/data', 'framework/sessions', 'logs', 'app/public'] as $dir) {
    if (!is_dir("/tmp/storage/$dir")) {
        @mkdir("/tmp/storage/$dir", 0755, true);
    }
}

require __DIR__ . '/../public/index.php';
