# AGENTS.md

Working guide for AI agents in this repository. Keep changes aligned with the current codebase, not generic Next.js habits.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict mode
- Bun package manager
- Tailwind CSS 4, Geist fonts, `next-themes`
- `next-intl` v4 with `localePrefix: "never"`
- Redux Toolkit for client app state
- TanStack React Query for client/server mutations and cached API state
- Neon Postgres via `@neondatabase/serverless` + Drizzle ORM
- Auth built on email OTP, JWT (`jose`), and WebAuthn/passkeys
- botid, Cloudflare Turnstile, Rollbar, Vercel Analytics/Speed Insights

## Commands

- `bun run dev` starts Next dev with Turbopack
- `bun run build` builds production output
- `bun run start` runs the production server
- `bun run typecheck` runs `tsc --noEmit`
- `bun run check` runs oxlint, oxfmt check, and typecheck
- `bun run fix` auto-fixes lint issues and writes formatting
- `bun run email:dev` starts the React Email preview server for `app/components/email`

## Repo Shape

- `app/` is the whole application
- `app/(app)` holds the main site with shared header/footer/mobile nav
- `app/(auth)` holds auth pages
- `app/(media)` holds media-heavy pages such as watch/photos
- `app/api/v1` holds REST endpoints
- `app/components` is organized by feature, not by primitive-only design system rules
- `app/lib` holds business logic: `api`, `auth`, `config`, `data`, `events`, `forms`, `i18n`, `recordings`, `redux`, `rollbar`, `utils`
- `app/locales` is split by namespace directory, not only root `en.json`/`cs.json`
- `db/drizzle/migrations` contains SQL migrations and generated schema metadata
- `i18n/` holds next-intl request/routing/navigation setup

## Conventions That Matter

- Default to server components. Add `"use client"` only for browser APIs, local interaction, Redux, React Query, or imperative effects.
- Typical pattern: server `page.tsx` fetches data and passes it into a feature client component.
- Route groups are meaningful here. Preserve existing `(app)`, `(auth)`, and `(media)` boundaries.
- Prefer existing feature modules over adding new top-level utility folders.
- Use `@/*` for imports from `app/*` and `@/i18n/*` for `i18n/*`.
- Follow the existing style: 2 spaces, semicolons, double quotes, trailing commas, 100-char width.
- Avoid comments unless the code is genuinely hard to parse.
- Do not add `useMemo`/`useCallback` by default. React Compiler is enabled.

## Providers And App Wiring

- Root wiring lives in `app/layout.tsx` and `app/AppProviders.tsx`.
- Provider order matters: i18n sync -> locale sync -> Redux -> auth init -> React Query -> motion -> theme -> global player.
- The root layout also mounts Rollbar, navigation loading, Vercel analytics, and speed insights.
- Main app chrome comes from `app/(app)/layout.tsx`.

## i18n

- Supported locales are English and Czech.
- Locale prefix is never used in URLs.
- Build-time/static rendering is English-only. Treat English as the server-rendered baseline.
- `i18n/request.ts` currently resolves to `DEFAULT_LOCALE` during server rendering/build.
- Czech localization happens on the client after hydration via the existing i18n sync path and locale cookie handling.
- Messages are merged from many namespace files in `app/lib/i18n/messages.ts`.
- When adding UI text, update both `en` and `cs` namespace files in the relevant folder under `app/locales`.
- Server components use `getTranslations`; client components use `useTranslations`.

## State And Data

- Redux store is in `app/lib/redux/store.ts` with slices for `auth`, `profile`, `videoEngagement`, and `player`.
- React Query providers and API hooks live in `app/components/shared/QueryProvider.tsx` and `app/lib/api/*`.
- Database access goes through `app/lib/data/*`; use the shared Drizzle client from `app/lib/data/db.ts`.
- Schema code is in `app/lib/data/schema.ts`; migrations live under `db/drizzle/migrations`.
- Static content for recordings, events, albums, and short links is stored under `app/data`.

## API Patterns

- REST handlers live in `app/api/**/route.ts`.
- Reuse helpers from `app/lib/api/auth.ts`, `app/lib/api/rate-limit.ts`, and `app/lib/api/route-wrappers.ts`.
- Prefer wrapper composition such as `withRequestContext`, `withRateLimit`, `withAuth`, `withRole`, and `withResolvedUserId` instead of open-coding auth/rate-limit logic.
- Return `NextResponse.json(...)` with stable `{ error: ... }` payloads on failures.
- Update `app/lib/api/routes.ts` when adding client-consumed endpoints.
- Validate request/response shapes with existing Zod schemas when applicable.

## Auth, Security, And Forms

- Auth supports email OTP plus WebAuthn/passkeys. Check `app/lib/auth/*` before adding auth code.
- Server env is validated with Zod in `app/lib/config/env.ts`.
- Forms and bot protection live in `app/lib/forms/*` and related UI components.
- Sensitive flows already use Turnstile, JWT helpers, rate limiting, CSP headers, and request-context logging.
- If a page or route changes auth behavior, check both API handlers and the client auth sync path.

## Caching And Performance

- This codebase uses Next 16 cache APIs such as `"use cache"`, `cacheLife`, `cacheTag`, and `revalidateTag`.
- Preserve cache invalidation when editing likes, boosts, RSVPs, trending, or library/newsletter data.
- Prefer server fetching and parallel data loading over client `useEffect` fetches.
- Use `next/image` for images unless the existing component abstraction already handles it.
- Be careful with large client boundaries in recordings, events, and newsletter editor flows.

## Environment

Important env vars are defined in `.env.example`. Common ones:

- `BNF_NEON_DATABASE_URL`
- `BNF_DISABLE_DB_DURING_BUILD`
- `BNF_TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY`
- `BNF_RESEND_API_KEY`
- `BNF_RESEND_FROM`
- `BNF_OTP_SECRET`
- `BNF_JWT_PRIVATE_KEY`
- `BNF_JWT_PUBLIC_KEY`
- `BNF_JWT_ISSUER`
- `BNF_JWT_AUDIENCE`
- `BNF_WEBAUTHN_RP_ID`
- `BNF_WEBAUTHN_ORIGIN`
- `CRON_SECRET`
- Rollbar and version variables

## When Making Changes

- For new pages: add the route, metadata if needed, and both locale files.
- For new API routes: add the handler, reuse wrappers, add client route constants if needed, and think about rate limits/auth.
- For new DB work: update schema code and add a migration under `db/drizzle/migrations`.
- For new user-facing copy: update the appropriate namespace pair under `app/locales/**/{en,cs}.json`.
- Before finishing, run `bun run check` when feasible.
