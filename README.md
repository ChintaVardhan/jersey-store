# Jersey Store

Gen Z e-commerce for **football & cricket jerseys** — Fan Edition, Master Copy, and Custom Build kits. Immersive hang-rack homepage (Yeezy/Corteiz energy), full auth, cart, checkout, admin.

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Framer Motion (hero / rack motion)
- Auth.js (credentials + Google when keys set)
- Prisma + SQLite (local) → switch to PostgreSQL for production
- Zustand cart / wishlist
- Razorpay + Stripe (test keys optional; Demo pay works without keys)
- Resend / GA4 / Meta Pixel hooks via env

## Quick start

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo logins

| Role        | Email                   | Password   | Portal        |
|-------------|-------------------------|------------|---------------|
| Super Admin | super@jerseystore.com   | jersey123  | `/staff`      |
| Admin       | admin@jerseystore.com   | jersey123  | `/staff`      |
| Customer    | fan@jerseystore.com     | jersey123  | `/login`      |

Staff portal: [http://localhost:3000/staff](http://localhost:3000/staff) — pick **Admin** or **Super Admin**, then sign in.

## Environment

Copy `.env.example` → `.env`. Important vars:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | `file:./dev.db` locally, or Postgres URL in prod |
| `AUTH_SECRET` | Required for sessions |
| `AUTH_GOOGLE_CLIENT_ID/SECRET` | Optional Google OAuth |
| `RAZORPAY_*` / `STRIPE_*` | Optional live/test payments |
| `RESEND_API_KEY` | Optional order emails |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | Analytics |

### Production Postgres

1. Change `provider = "postgresql"` in `prisma/schema.prisma`
2. Set `DATABASE_URL` to Neon/Supabase
3. Run `npx prisma migrate dev`

## Features

- Immersive homepage: floating jersey rack, lime brand pill, Enter Drop CTA
- Shop filters, search, PDP + Product JSON-LD
- Custom builder (name / number / patches + live preview)
- Cart, wishlist, checkout (demo / Razorpay / Stripe)
- Account orders & addresses
- Admin stock + order status / tracking
- Trust pages: shipping, returns, size guide, contact, FAQ
- SEO: metadata, sitemap, robots

## Logo TODO

Search for `TODO: swap` / `TODO: replace` — brand mark is a lime pill labeled **Jersey Store**. Drop your logo into `public/` and update `ImmersiveNav` + metadata icons.

## Scripts

- `npm run dev` — development
- `npm run db:setup` — push schema + seed 18 products
- `npm run build` / `npm start` — production
