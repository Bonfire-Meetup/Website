# Bonfire Events Homepage

Welcome to the official Bonfire Events homepage. It burns bright, loads fast (mostly), and occasionally refuses to cooperate on mobile. You're in good company.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- next-intl for i18n
- Bun for scripts/dev

## Local dev

```bash
bun install
bun run dev
```

## Neon (likes)

This project uses Neon Postgres for the video likes ("Spark") system.

Required env vars:

- `BNF_NEON_DATABASE_URL` (Neon connection string)
- `BNF_HEARTS_SALT` (long random string for hashing IP/UA)

Generate a salt: `openssl rand -hex 32`

Schema: see `db/video-likes-schema.sql`

## API

### Likes

- `GET /api/v1/video/:id/likes` -> `{ count, hasLiked }`
- `POST /api/v1/video/:id/likes` -> `{ count, added }`
- `DELETE /api/v1/video/:id/likes` -> `{ count, removed }`

User identification: SHA256 hash of IP + User-Agent (no auth required).

### CSRF

- `GET /api/v1/csrf` -> `{ token }`

Sets `bnf_csrf` httpOnly cookie used by server actions for form submissions.

## Forms

Contact + speaker proposal forms use server actions, Turnstile, and CSRF.

Required env vars:

- `BNF_TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY`

## Auth (email OTP)

Passwordless email login with numeric OTP codes and JWT Bearer tokens (no cookies).

Endpoints:

- `POST /api/v1/auth/challenges` -> `{ ok: true, challenge_token }`
- `POST /api/v1/auth/tokens` -> `{ access_token, token_type, expires_in }`

Security note: OTP verification includes a fixed failure delay and a dummy hash comparison on missing/expired challenges to reduce timing differences between valid and invalid attempts.

Required env vars:

- `BNF_OTP_SECRET`
- `BNF_JWT_PRIVATE_KEY` (Ed25519 PKCS8)
- `BNF_JWT_PUBLIC_KEY` (Ed25519 SPKI)
- `BNF_JWT_ISSUER`
- `BNF_JWT_AUDIENCE`

Generate secrets:

- `BNF_OTP_SECRET`: `openssl rand -hex 32`
- `BNF_JWT_PRIVATE_KEY`: `openssl genpkey -algorithm ED25519 -outform PEM | openssl pkcs8 -topk8 -nocrypt -outform PEM`
- `BNF_JWT_PUBLIC_KEY`: `openssl pkey -pubout -in <(echo "$BNF_JWT_PRIVATE_KEY")`
- `BNF_LOG_SALT`: `openssl rand -hex 32`

Schema: see `db/auth-schema.sql`

## Logging

Structured JSON logs are emitted for auth flows with privacy-friendly fingerprints.

Optional env vars:

- `BNF_LOG_SALT`

## Email (Resend)

Email sending uses Resend via a small library wrapper for future integrations.

Required env vars:

- `BNF_RESEND_API_KEY`
- `BNF_RESEND_FROM` (verified sender)

## Trending

Homepage "Trending" section uses ISR (revalidate: 1 hour).

Scoring algorithm:

- Sparks (likes): `count × 3`
- Boosts: `count × 5`
- Recency: +10 (≤120d), +7 (≤240d), +4 (≤365d), +2 (≤540d)
- Featured: +3

Boosts are weighted higher than sparks because they require authentication, making them harder to game while providing a signal of committed member engagement.

Selection constraints:

- Location cap: no more than `ceil(limit / 2)` per location
- Quarter cap: no more than `ceil(limit / 3)` per quarter
- Backfill from remaining records if caps prevent filling the limit

DB calls: ~24/day (1 per revalidation), cached at edge.

## Related talks

Used on the watch page sidebar. Goal: return up to 4 recordings with a strong "next up" plus diversity, and always fill the list if possible.

Inputs:

- Current recording
- All recordings
- Limit (default 4)

Scoring factors (higher is better):

- Same episode: +6
- Same location: +2
- Shared tags: +3 each (cap 3)
- Shared speakers: +4 each (cap 2)
- Recency: +2 (≤90d), +1 (≤180d)

Selection flow:

- Build candidate list excluding the current recording.
- Determine the first pool with any matches in this order: tags, speakers, episode, location, else all.
- Pick "next up" as the best candidate by shared tags, shared speakers, same episode, score, recency, then title.
- Fill remaining slots from the same pool, penalizing overlap with already selected items to keep variety.
- If still short, widen to the next pools in order, then finally allow any remaining items (including same episode) to reach the limit.

## Contributing

PRs welcome - especially for performance fixes, layout tweaks, and “why is this pixel doing that” mysteries. If you spot a bug, send a PR (or at least a good meme with the issue).
