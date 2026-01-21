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

Schema: see `db/schema.sql`

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

## Trending

Homepage "Trending" section uses ISR (revalidate: 1 hour).

Scoring algorithm:

- Likes: `count × 3`
- Recency: +10 (≤30d), +7 (≤90d), +4 (≤180d), +2 (≤365d)
- Featured: +3

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

PRs welcome — especially for performance fixes, layout tweaks, and “why is this pixel doing that” mysteries. If you spot a bug, send a PR (or at least a good meme with the issue).
