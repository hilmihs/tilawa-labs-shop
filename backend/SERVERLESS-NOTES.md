# Serverless deployment attempt — unresolved

The Laravel API does **not** currently run on Vercel's community PHP runtime.

## What was tried

`api/index.php` as the entrypoint, `vercel.json` declaring
`vercel-php@0.7.4`, and every writable path redirected to `/tmp`
(`bootstrap/app.php` calls `useStoragePath`, and the config/route/view cache
paths are set by environment variable because Laravel reads them before the
application object exists).

That part is sound: the same entrypoint serves `/api/v1/products` correctly
when run locally with `VERCEL=1`.

## Where it fails

The function builds (83 MB, `api/index`) and then exits immediately:

```
Application exited with code 1
FUNCTION_INVOCATION_FAILED
```

With `APP_DEBUG=true` the response is still the platform's error page, not
Laravel's — so PHP dies before the framework boots.

A deliberately trivial probe function, twelve lines echoing `PHP_VERSION` and a
list of loaded extensions, **fails identically**. That rules out Laravel, the
autoloader, the database and the storage redirect: the runtime itself is not
starting.

## What this means

Not a code problem, so not one to keep iterating on. The repository already
targets the right shape — `backend/Dockerfile` runs FrankenPHP and `render.yaml`
describes a Docker web service. The API wants a container host, not a PHP
shim on a JavaScript platform.

Options, cheapest first:

1. **Render free web service** (Docker, `render.yaml` already written — change
   `plan: starter` to `plan: free`). Free forever, but the instance sleeps after
   15 minutes and the next request waits roughly a minute for a cold start. On a
   link handed to a recruiter, that minute is fatal.
2. **Render starter**, about 7 USD a month, always warm.
3. **Fly.io / Railway** — comparable, both need a card.

The database is already provisioned and seeded on Neon (`ecommerce`), so
whichever host is chosen only needs the environment variables in `.env.example`.

## Also unresolved: CORS in local development

The storefront calls the API cross-origin (`localhost:3106` → `127.0.0.1:8080`)
and the admin sign-in returns "Failed to fetch". The frontend ships a
`DEMO ADMIN (frontend-only)` path that bypasses the API entirely, so the admin
screens can still be demonstrated without solving this.
