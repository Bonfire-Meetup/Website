# Bonfire Events Homepage

Bonfire VOD + events portal built with Next.js App Router.

## Stack

- Next.js 16
- React 19 + TypeScript
- Tailwind CSS 4
- Redux Toolkit + TanStack React Query
- `next-intl`
- Neon Postgres
- Bun

## Important Runtime Note

- Pages are pre-rendered in English at build time.
- Non-English localization is applied on the client after hydration.

## Quick Start

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## Scripts

- `bun run dev` - Start local dev server
- `bun run build` - Production build
- `bun run start` - Run production build
- `bun run typecheck` - TypeScript only
- `bun run check` - Lint + format check + typecheck
- `bun run fix` - Auto-fix lint + format

## Environment Variables

Copy from `.env.example` and fill required values.

Core:

- `BNF_NEON_DATABASE_URL`
- `BNF_HEARTS_SALT`

Auth:

- `BNF_OTP_SECRET`
- `BNF_JWT_PRIVATE_KEY`
- `BNF_JWT_PUBLIC_KEY`
- `BNF_JWT_ISSUER`
- `BNF_JWT_AUDIENCE`

Forms / bot protection:

- `BNF_TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY`

Check-ins:

- `BNF_CHECKIN_SECRET`

Email:

- `BNF_RESEND_API_KEY`
- `BNF_RESEND_FROM`

Optional:

- `BNF_LOG_SALT`

## Key API Areas

- Auth: `/api/v1/auth/*`
- Library/filtering: `/api/v1/library`
- Video engagement: `/api/v1/videos/[id]/likes`, `/api/v1/videos/[id]/boosts`
- Event RSVPs: `/api/v1/events/[eventId]/rsvps`
- CSRF: `/api/v1/csrf`

## Project Layout

- `app/` - App Router pages, API routes, UI, business logic
- `db/` - SQL schema and drizzle migrations
- `public/` - Static assets

## Security Notes

- JWT auth (Ed25519)
- CSRF protection for forms
- Cloudflare Turnstile + botid
- Rate limiting on sensitive endpoints
