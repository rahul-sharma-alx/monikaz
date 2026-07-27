# Monikaz Parlour — Agent Guide

## Commands
- `npm run dev` — starts Express API + Vite dev together (via `tsx server.ts`)
- `npm run build` — Vite build + esbuild server bundle
- `npm run start` — production server from `dist/`
- `npm run lint` — TypeScript type-check only (`tsc --noEmit`), no test runner configured

## Architecture
- **Frontend**: React 19 SPA at `src/`, entrypoint `src/main.tsx` → `App.tsx`
- **Backend**: Express server in `server.ts` — CRUD API at `/api/*`, SSE realtime at `/api/realtime/stream`
- **Data**: JSON file `data/store.json` (no real DB required), in-memory + persisted on writes. Supabase is optional — `src/lib/supabase.ts` reads env vars or localStorage, API layer in `src/services/api.ts` falls back to Express endpoints if Supabase unavailable
- **Auth**: localStorage-based simulated profiles only (see `INITIAL_PROFILES` in `src/data/initialData.ts`)

## Quirks
- `@/*` path alias maps to project root (`.`), not `src/`. Write `@/src/types` not `@/types`.
- Tailwind v4: use `@import "tailwindcss"` in CSS, no `@tailwind` directives
- Vite dev HMR/file-watching controlled by `DISABLE_HMR` env var — set to `true` during agent edits to prevent flicker
- GSAP + ScrollTrigger registered in `src/components/SmoothScroll.tsx` via Lenis integration
- No test framework, no CI/CD, no pre-commit hooks

## Local skills (`.opencode/skills/`)
Design, brand, UI styling, slides, UI-UX — load via `skill()` for UI/design guidance.
