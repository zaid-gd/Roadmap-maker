# ZNS RoadMap Studio

ZNS RoadMap Studio turns raw guides, playbooks, curricula, and notes into interactive learning workspaces. Paste content or upload a markdown file, let the AI structure it, and work through modules, tasks, resources, notes, and progress tracking in one place.

## Features

- AI-powered parsing for roadmaps, playbooks, tutorials, strategies, and other structured content
- Interactive workspace with modules, milestones, notes, resources, videos, and progress tracking
- Local-first persistence with optional Supabase sync
- Markdown, JSON, and PDF export
- User-configurable AI provider, model, and API key

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase SSR client

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with the variables you need:

```env
AI_PROVIDER=gemini
AI_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
STRIPE_AGENCY_MONTHLY_PRICE_ID=
STRIPE_AGENCY_ANNUAL_PRICE_ID=
```

3. Start the app:

```bash
npm run dev
```

## Supabase Setup

If you want the full backend enabled:

- Run the SQL in [supabase/roadmaps.sql](./supabase/roadmaps.sql).
- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Add Stripe env vars if you want subscription checkout and webhook support.
- Keep `proxy.ts` enabled so Supabase SSR sessions stay in sync.

## Scripts

- `npm run dev` - start the local dev server
- `npm run build` - run a production build
- `npm run start` - start the production server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript without emitting files

## Project Notes

- Data is stored locally by default.
- If a user configures Supabase, the app syncs saved workspaces to the `roadmaps` table.
- Custom AI keys are stored in browser storage and sent only to the selected provider when used.

## Open Source

This repository is still in active development. Expect UI and schema changes while the workspace model evolves.
