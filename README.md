# tilawa-labs-shop

A demo copy of an Indonesian e-commerce application, published so the code can be read.
Author: Hilmi Hanif Sobandi. The application calls itself "Toko Nusa" throughout the code
(`APP_NAME` in `backend/.env.example`, the `store_settings.name` default, the `Wordmark`
component); this repository name is just the portfolio slug.

AI-assisted development: I used an AI coding assistant while building this, and reviewed and
tested the result myself.

**Live storefront: https://tilawa-labs-shop.vercel.app** — the Next.js half only. The Laravel
API is not hosted, so the catalogue falls back to the seeded product list and checkout stays in
the demo mode described under [Honest scope](#honest-scope). See
[Deployment status](#deployment-status) for what that means and why.

## What it does

A storefront and an admin back office for a small Indonesian retailer:

- Public product catalogue with slug URLs, paginated 24 per page, images attached per product.
- Guest checkout — no customer account required. The order is keyed by an `order_number`
  (`TN-<Ymd>-<8 random chars>`), which is also the lookup key for the public order page.
- Payment through Midtrans Snap (token + redirect URL issued at checkout, settlement
  confirmed by webhook).
- Shipping cost from two sources: live RajaOngkir courier quotes, or flat-rate shipping zones
  the admin defines (a zone is a name, a list of cities, a cost and an ETD).
- Admin area behind Sanctum token auth: product CRUD with image upload, order list and
  detail, order status changes, store settings, shipping zones, sellers, promotions, payment
  methods.

## Architecture

Two independent applications in one repository. `backend/` is a Laravel 12 JSON API
(`laravel/framework ^12.0`, PHP `^8.3`, `laravel/sanctum ^4.0`, `midtrans/midtrans-php ^2.6`,
`league/flysystem-aws-s3-v3` for object storage) with no Blade views and no web routes —
`bootstrap/app.php` registers only `routes/api.php`, `routes/console.php` and the `/up` health
endpoint. `frontend/` is a separate Next.js 15 App Router app (`next ^15.1`, React 19,
TypeScript 5.7, Tailwind 3.4) that talks to the API over `NEXT_PUBLIC_API_BASE_URL` and holds
no server-side secrets. Auth is Sanctum **personal access tokens**, not cookie sessions: the
admin posts to `/api/v1/admin/login`, gets back a plain-text token, and the frontend sends it
as `Authorization: Bearer …` (`frontend/lib/api.ts`, the `adminApi` object). There is exactly
one role check — `users.role` defaults to `admin`, `User::isAdmin()` compares it, and the
`admin` middleware alias (`app/Http/Middleware/EnsureAdmin.php`) wraps the whole admin route
group behind `auth:sanctum`. The data model is 12 tables created by 10 migration files in
`backend/database/migrations`: `users`, `personal_access_tokens`, `products`, `product_images`,
`orders`, `order_items`, `payments`, `store_settings`, `shipping_zones`, `sellers`,
`promotions`, `payment_methods` — counted by reading each migration's `Schema::create` calls.
Orders snapshot their line items (`product_name`, `product_slug`, `unit_price`, `line_total`,
`weight_grams` are copied onto `order_items`, and `product_id` is `nullOnDelete`), so deleting
or repricing a product cannot rewrite history. All money is stored as unsigned integers in
rupiah, never floats.

Repository size, for calibration: 11 Eloquent models, 15 controllers (7 public, 8 admin),
12 form-request validation classes and 4 service classes — counted by listing
`backend/app/Models`, `backend/app/Http/Controllers/{Api,Admin}`, `backend/app/Http/Requests`
and `backend/app/Services`. `routes/api.php` contains 24 route registrations, 4 of which are
`Route::apiResource` (five endpoints each) and one a two-verb `Route::match`. The frontend has
31 `page.tsx` route files under `frontend/app`.

## Engineering decisions worth looking at

**The server never trusts a client-supplied price, weight or total.**
`app/Services/CartPricingService.php` takes only `product_id` and `quantity`, groups duplicate
lines, loads the products through the `active()` scope (`is_active` **and** `stock > 0`),
rejects the request if any requested id did not come back, checks stock per line, and returns
the subtotal and total weight it computed itself. `CheckoutController` then re-derives the
total from that result plus the quote's cost, and refuses the order if the quote's
`weight_grams` no longer equals the freshly computed cart weight — so a stale or tampered
shipping quote cannot be replayed into a cheaper order. The order insert, its line items and
the `stock` decrements all happen inside one `DB::transaction`.

**The payment webhook assumes the caller is hostile.**
`app/Http/Controllers/Api/MidtransWebhookController.php` verifies the SHA-512 signature over
`order_id + status_code + gross_amount + server_key` with `hash_equals` before touching the
database, then compares the payload's `gross_amount` against the stored order total and aborts
with 422 on a mismatch. State is derived by matching Midtrans' `transaction_status` to an
internal `payment_status`, including the `capture` + `fraud_status: challenge` case, and the
write is an `updateOrCreate` keyed on the `(provider, provider_order_id)` unique index — so a
redelivered webhook is idempotent rather than a duplicate payment row. Both the route and the
signature path are covered by `backend/tests/Feature/MidtransWebhookTest.php`.

**Order status is a state machine in the model, not an `if` in a controller.**
`Order::canTransitionTo()` holds the allowed-successor map (`pending_payment → paid|cancelled`,
`paid → processing|cancelled`, `processing → shipped|cancelled`, `shipped → completed`,
`completed`/`cancelled` terminal). The admin endpoint validates that the submitted value is one
of the six known statuses (`AdminOrderStatusRequest`) *and* that the transition is legal, so the
admin UI cannot walk an order backwards from `shipped` to `pending_payment`.

**Deployment was a dead end, and the dead end is documented rather than deleted.**
`backend/SERVERLESS-NOTES.md` records a failed attempt to run Laravel on Vercel's community PHP
runtime: the writable-path redirects were correct and the same entrypoint served
`/api/v1/products` locally with `VERCEL=1`, but the deployed function exited with code 1 — and a
twelve-line probe function failed identically, which ruled out Laravel and pointed at the runtime
itself. The conclusion was to stop iterating and move to a container host, which is why
`backend/Dockerfile` runs FrankenPHP and `render.yaml` describes a Docker web service. The
abandoned `backend/api/index.php` and `backend/vercel.json` are still in the tree, and
`bootstrap/app.php` still carries the `/tmp` storage redirect.

## Honest scope: what is wired up and what is not

The backend endpoints described above all exist and are reachable. The **frontend currently runs
its customer-facing flow in demo mode**, and this is explicit in the code rather than hidden:

- `frontend/lib/api.ts` — `checkout()` does not POST to `/api/v1/checkout`; it calls
  `saveMockOrder()` and persists the order in `localStorage` (`frontend/lib/mock-checkout.ts`).
  `getOrder()` reads from the same store. `quoteShipping()` does hit the real
  `/api/v1/shipping-zones`, and only falls back to a generated quote when no zones exist or the
  API is unreachable.
- Customer and seller sign-in are frontend-only. `frontend/lib/session.tsx` holds hard-coded
  `DEMO_ACCOUNTS` gated behind `IS_DEV` (`process.env.NODE_ENV !== "production"`), so they are
  not exposed in a production build. The seller portal (`frontend/lib/seller.ts`) says so in its
  own header comment: the backend has no seller endpoints, only admin CRUD.
- Admin sign-in does use the real API first (`frontend/app/admin/login/page.tsx` calls
  `adminApi.login`), and falls back to the demo account only in development. When no backend
  token is present, `components/AdminGuard.tsx` flags `isDemo` and pages render a
  `DemoModeBanner` reading "Logged in with frontend-only demo credentials".
- `frontend/lib/marketplace.ts` derives seller attribution, ratings, units sold and
  strike-through prices deterministically from the product id. That is presentation filler, not
  data.
- `SERVERLESS-NOTES.md` names the reason the storefront is not yet wired to the live API: an
  unresolved cross-origin failure between the Next dev server and the local API.

Test coverage is thin and I would not describe it otherwise: two feature tests
(`ProductApiTest`, `MidtransWebhookTest`) running on in-memory SQLite per `backend/phpunit.xml`.

## Deployment status

**Frontend: deployed.** The storefront runs on Vercel at
https://tilawa-labs-shop.vercel.app. With no API reachable, `getProducts` and `getProduct` in
`frontend/lib/api.ts` fall back to `frontend/lib/demo-catalogue.ts` — eight products generated
from `backend/database/seeders/ProductSeeder.php`, so the demo shows exactly what a freshly
seeded backend would serve. This is the same degradation `quoteShipping` already used for
shipping zones. Nothing is faked beyond that: checkout, orders and auth behave as the Honest
scope section describes.

**Backend: not deployed.** `render.yaml` at the repository root is written and ready — `runtime: docker`,
`rootDir: backend`, `plan: free`, `region: singapore`, `healthCheckPath: /up`, with `APP_KEY`,
`APP_URL`, `FRONTEND_URL`, `DATABASE_URL` and the Midtrans/RajaOngkir keys marked
`sync: false` so they are entered in the dashboard and never committed. Its own header comment
notes the trade-off that stopped it from being used as a recruiter-facing link: a free instance
sleeps after 15 minutes idle and the next request waits roughly a minute for a cold start.
The frontend has a `vercel.json` but likewise no deployment here.

## Running it locally

Both halves, two terminals. The backend serves on `http://localhost:8000`, the frontend on
`http://localhost:3000`.

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# .env.example defaults to pgsql with a placeholder host. Either point DB_HOST/
# DB_DATABASE/DB_USERNAME/DB_PASSWORD at a real Postgres, or for a quick read-only
# look use the sqlite connection that already exists in config/database.php:
#   DB_CONNECTION=sqlite
#   DB_DATABASE=/absolute/path/to/backend/database/database.sqlite
php artisan migrate --seed
php artisan serve
```

Seeding runs five seeders (`database/seeders/DatabaseSeeder.php`): an admin user
(`admin@example.com` / `password`, from `AdminUserSeeder`), 8 products each with one Unsplash
image URL, shipping zones, sellers and payment methods.

Frontend:

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api/v1
npm run dev
```

Tests, formatting and type checking:

```bash
cd backend  && composer test        # php artisan test
cd backend  && vendor/bin/pint      # laravel/pint
cd frontend && npm run typecheck    # tsc --noEmit
cd frontend && npm run lint
```

Midtrans and RajaOngkir credentials are optional. Without them the catalogue, cart, admin area
and zone-based shipping all work; only Snap payment and live courier quotes are unavailable —
`RajaOngkirService` throws a validation error naming the missing configuration rather than
failing obscurely.

## What to look at first

In rough order of how much they say about the code:

1. `backend/app/Services/CartPricingService.php` — server-side cart recomputation; the
   foundation of everything in checkout.
2. `backend/app/Http/Controllers/Api/CheckoutController.php` — the quote-weight re-check, the
   order/line-item/stock transaction, and where Midtrans is called.
3. `backend/app/Http/Controllers/Api/MidtransWebhookController.php` plus
   `backend/app/Services/MidtransService.php` — signature verification, amount verification,
   status mapping, idempotent write.
4. `backend/app/Models/Order.php` — `canTransitionTo()`, the status machine.
5. `backend/routes/api.php` — the complete API surface on one screen, including which routes are
   throttled and at what rate.
6. `backend/database/migrations/2026_05_18_000004_create_orders_table.php` — the order/line-item
   snapshot and integer money.
7. `backend/SERVERLESS-NOTES.md` — how a deployment failure was diagnosed and when it was
   abandoned.
8. `frontend/lib/api.ts` — the single typed API client; also where the demo-mode shortcuts are,
   commented in place.
9. `frontend/components/AdminGuard.tsx` — the render-prop guard that lets pages branch on real
   vs. demo session.
10. `render.yaml` — the deployment that is prepared but not running.

Skimmable in the other direction: `frontend/components/design.tsx` and the `jurnal/` pages are
presentation and editorial content, not logic.
