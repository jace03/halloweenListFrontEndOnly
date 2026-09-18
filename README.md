# Halloween Watchlist 🎃

A just-for-fun React + TypeScript app for tracking mine and my wife's favourite Halloween movies.

Data lives in a shared Supabase Postgres table — no login, since it's just the two of us — so the list stays in sync across whichever browser/device either of us opens it on.

## Features

- Add, edit, and delete movies
- Track title, year, who picked it, a 🎃 rating (1-5), watched status, and notes
- Filter by All / Unwatched / Watched
- "Reset to starter list" wipes the table and re-inserts the seed data
- Shared, persisted storage via Supabase — no localStorage

## Getting started

1. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and anon/publishable key (found in the Supabase dashboard under Project Settings -> API).
2. Install and run:

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Backend

- Table: `public.movies` — see [`openspec/changes/halloween-supabase-crud/design.md`](openspec/changes/halloween-supabase-crud/design.md) for the full schema and RLS policy.
- No auth: RLS is enabled but grants full read/write to the `anon` role, since there are no user accounts. Anyone with the published anon key can read/write the list — an accepted tradeoff for a two-person hobby app with no sensitive data.
- Client wiring: [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts) (connection) and [`src/hooks/useMovies.ts`](src/hooks/useMovies.ts) (fetch/add/update/delete/reset).

## Updating the seed list

The starter list lives in [`src/data/seedMovies.ts`](src/data/seedMovies.ts). It's only used by "Reset to starter list" — editing it doesn't touch the live Supabase data, only what a reset re-inserts.

## Spec

This project is documented spec-first in [`openspec/`](openspec/) — see `openspec/changes/halloween-supabase-crud/` for the proposal, design, and task list behind the current Supabase backend.

## Tech

Vite + React + TypeScript + Supabase (Postgres + PostgREST), no auth.
