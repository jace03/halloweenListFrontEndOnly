# Capability: movies-backend

Shared Supabase backend for the Halloween watchlist. No auth — open read/write via the anon/publishable key (accepted tradeoff for a two-person hobby app, see `changes/archive/halloween-supabase-crud/design.md`).

## Schema

Table `public.movies`:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key, `default gen_random_uuid()` |
| `title` | `text` | not null |
| `year` | `integer` | nullable |
| `added_by` | `text` | not null, `check in ('Me', 'Wife', 'Both')` |
| `rating` | `integer` | not null, `check between 1 and 5` |
| `watched` | `boolean` | not null, default `false` |
| `notes` | `text` | not null, default `''` |
| `created_at` | `timestamptz` | not null, default `now()` |

RLS is enabled with one permissive policy granting `anon` full `select`/`insert`/`update`/`delete`.

## Client wiring

- `src/lib/supabaseClient.ts` — client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (`.env.local`, gitignored; `.env.example` documents the shape).
- `src/hooks/useMovies.ts` — data-access hook: fetch on mount, `addMovie`, `updateMovie`, `deleteMovie`, `toggleWatched`, `resetToSeed`, plus `loading`/`error` state.

## Established via

`changes/archive/halloween-supabase-crud/`
