# AGENTS.md

Quick reference guide for AI agents working on this codebase.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode, ES2023 target)
- **Styling**: Tailwind CSS 4 with custom theme
- **State Management**: Redux Toolkit + TanStack React Query
- **i18n**: next-intl (English + Czech, locale prefix: never)
- **Database**: Neon Postgres (serverless)
- **Package Manager**: Bun
- **Linting/Formatting**: oxlint + oxfmt
- **Auth**: JWT (Ed25519) with email OTP (OAuth2-compliant)
- **Bot Protection**: botid, Cloudflare Turnstile
- **Analytics**: Vercel Analytics + Speed Insights

## Code Style

### Formatting
- **Code comments**: In most cases do not add code comments, code must be self-documenting at first
- **Print width**: 100 characters
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Double quotes (single quotes disabled)
- **Semicolons**: Required
- **Trailing commas**: Always
- **Arrow functions**: Always use parentheses: `(x) => x`
- **Line endings**: LF

### TypeScript
- Strict mode enabled
- No `any` types (error level)
- No unsafe assignments/calls (error level)
- Prefer nullish coalescing (`??`) and optional chaining (`?.`)
- Unused variables/args prefixed with `_` are ignored

### Imports
- Auto-sorted with newlines between groups:
  1. Side-effect imports
  2. Built-in
  3. External
  4. Internal (`@/`)
  5. Parent/sibling
  6. Index
- Unused imports auto-removed

### Naming
- Components: PascalCase (`UserProfile.tsx`)
- Files: kebab-case for utilities, PascalCase for components
- Client components: Often suffixed with `Client` (e.g., `MeClient.tsx`)
- Hooks: `use` prefix (`useAuthSync.ts`)
- Constants: UPPER_SNAKE_CASE

## Project Structure

```
app/
  ├── api/v1/          # API routes (REST endpoints)
  ├── components/      # React components (organized by feature)
  ├── lib/             # Utilities, business logic
  │   ├── api/         # API client code
  │   ├── auth/        # Authentication logic
  │   ├── data/        # Database access layer
  │   ├── redux/       # Redux store, slices, hooks
  │   └── utils/       # Helper functions
  ├── locales/         # i18n translation files (en.json, cs.json)
  └── [routes]/        # Next.js pages (App Router)

db/                    # SQL schema files
i18n/                  # i18n configuration
```

## Key Patterns

### Server vs Client Components
- **Default**: Server components (async, can fetch data)
- **Client components**: Mark with `"use client"` directive
- Pattern: Server page → Client component for interactivity
- Example: `app/me/page.tsx` (server) → `MeClient.tsx` (client)

### State Management
- **Redux**: Global UI state (auth, profile, player, video engagement)
  - Slices in `app/lib/redux/slices/`
  - Typed hooks in `app/lib/redux/hooks.ts`
- **React Query**: Server state, API caching, mutations
  - Queries/mutations in `app/lib/api/*.ts`
  - Provider in `app/components/shared/QueryProvider.tsx`

### API Routes
- Location: `app/api/v1/*/route.ts`
- Pattern: Export `GET`, `POST`, `DELETE`, etc. handlers
- Auth: Use `requireAuth()` from `app/lib/api/auth.ts`
- Response: `NextResponse.json(body, { status })`
- Error handling: Structured logging via `logError()`

### Forms
- Server actions in `app/lib/forms/form-actions.ts`
- CSRF protection: Get token from `/api/v1/csrf`
- Turnstile verification for bot protection
- Use `useFormState` or `useActionState` (React 19)

### Internationalization
- Translations: `app/locales/{locale}.json`
- Server: `getTranslations()` from `next-intl/server`
- Client: `useTranslations()` hook
- Locale detection: Automatic (no URL prefix)

### Styling
- Tailwind CSS 4 with custom theme
- Dark mode: `.dark` class on `<html>`
- Custom colors: Brand (fuchsia), Fire gradient, Location colors
- Utility: `clsx` + `tailwind-merge` for conditional classes

### Path Aliases
- `@/*` → `app/*`
- `@/i18n/*` → `i18n/*`

## Redux Slices

- `authSlice`: Authentication state, tokens
- `profileSlice`: User profile, boosts, watchlist, preferences
- `videoEngagementSlice`: Likes, boosts per video
- `playerSlice`: Global video player state

## API Conventions

- Base: `/api/v1/`
- Auth: Bearer tokens in `Authorization` header
- Errors: `{ error: "error_code" }` with appropriate status
- Success: Domain-specific response shapes
- Rate limiting: Applied via `app/lib/api/rate-limit.ts`

## Database

- Neon Postgres (serverless)
- Connection: `@neondatabase/serverless`
- Schemas: `db/*.sql` files
- Access: Functions in `app/lib/data/*.ts`

## Environment Variables

Key vars (see `.env.example`):
- `BNF_NEON_DATABASE_URL`
- `BNF_JWT_PRIVATE_KEY` / `BNF_JWT_PUBLIC_KEY`
- `BNF_OTP_SECRET`
- `BNF_RESEND_API_KEY`
- `BNF_TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY`

## Common Tasks

### Adding a new page
1. Create `app/[route]/page.tsx` (server component)
2. Add translations to `app/locales/*.json`
3. If interactive, create `*Client.tsx` component

### Adding an API route
1. Create `app/api/v1/[endpoint]/route.ts`
2. Export HTTP method handlers
3. Add route to `app/lib/api/routes.ts`
4. Add auth if needed: `requireAuth()`

### Adding a Redux slice
1. Create slice in `app/lib/redux/slices/`
2. Add to store in `app/lib/redux/store.ts`
3. Export typed hooks in `app/lib/redux/hooks.ts`

### Adding translations
1. Add keys to `app/locales/en.json` and `app/locales/cs.json`
2. Use `getTranslations()` (server) or `useTranslations()` (client)

## Linting & Formatting

- **Lint**: `bun run lint` (oxlint)
- **Format**: `bun run format:write` (oxfmt)
- **Check**: `bun run check` (lint + format)
- Auto-fix available: `bun run fix`

## React Performance Rules

**Critical**: Speed and efficiency are paramount.

- **React Compiler**: Enabled - trust it, don't manually add `useMemo`/`useCallback`
- **Server Components by default**: Fetch data server-side, minimize client boundaries
- **Images**: Always use `next/image` with `width`/`height`, `priority` only for above-fold
- **State**: React Query for server state, Redux for global client state, `useState` for local
- **Code splitting**: Use `next/dynamic` for heavy components, leverage Suspense
- **Network**: Cache aggressively (React Query), fetch in parallel, use ISR (`revalidate`)
- **Bundle**: Tree-shake imports, dynamic import heavy libs, monitor bundle size
- **Anti-patterns**: ❌ `useEffect` for fetching (use React Query/server components), ❌ blocking renders (use Suspense), ❌ over-fetching

## Security

- CSP headers configured in `next.config.ts`
- CSRF tokens for forms
- JWT with Ed25519 keys
- Bot protection via botid
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas
