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

## Neon (hearts)

This project uses Neon Postgres for the video heart system.

Required env vars:

- `BNF_NEON_DATABASE_URL` (Neon connection string)
- `BNF_HEARTS_SALT` (long random string for hashing IP/UA)

Generate a salt: `openssl rand -hex 32`

## API

### Hearts

- `GET /api/video/:id/hearts` -> `{ count, hasHearted }`
- `POST /api/video/:id/hearts` -> `{ count, added }`
- `DELETE /api/video/:id/hearts` -> `{ count, removed }`

## Contributing

PRs welcome — especially for performance fixes, layout tweaks, and “why is this pixel doing that” mysteries. If you spot a bug, send a PR (or at least a good meme with the issue).
