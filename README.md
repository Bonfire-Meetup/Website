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

- `GET /api/video/:id/likes` -> `{ count, hasLiked }`
- `POST /api/video/:id/likes` -> `{ count, added }`
- `DELETE /api/video/:id/likes` -> `{ count, removed }`

User identification: SHA256 hash of IP + User-Agent (no auth required).

## Trending

Homepage "Trending" section uses ISR (revalidate: 1 hour).

Scoring algorithm:

- Likes: `count × 3`
- Recency: +10 (≤30d), +7 (≤90d), +4 (≤180d), +2 (≤365d)
- Featured: +3

DB calls: ~24/day (1 per revalidation), cached at edge.

## Contributing

PRs welcome — especially for performance fixes, layout tweaks, and “why is this pixel doing that” mysteries. If you spot a bug, send a PR (or at least a good meme with the issue).
