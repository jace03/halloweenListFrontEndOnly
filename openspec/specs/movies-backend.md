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
| `rating` | `integer` | not null, `check between 0 and 10` — a 0-10 score assigned by Jace/his wife, distinct from `rank` |
| `genre` | `text` | nullable |
| `decade` | `text` | nullable, free-form (e.g. `'1990s'`) |
| `rank` | `integer` | nullable, open-ended "order of favorite" position (higher = closer to the top), not bounded like `rating` |
| `watched` | `boolean` | not null, default `false` |
| `notes` | `text` | not null, default `''` |
| `created_at` | `timestamptz` | not null, default `now()` |

Table `public.actors`:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key, `default gen_random_uuid()` |
| `name` | `text` | not null |
| `created_at` | `timestamptz` | not null, default `now()` |

Table `public.movie_actor` (many-to-many bridge, for filtering movies by favorite actor):

| Column | Type | Notes |
|---|---|---|
| `movie_id` | `uuid` | references `movies(id)`, `on delete cascade` |
| `actor_id` | `uuid` | references `actors(id)`, `on delete cascade` |

Primary key is `(movie_id, actor_id)`.

RLS is enabled on all three tables, each with one permissive policy granting `anon` full `select`/`insert`/`update`/`delete`.

## Client wiring

- `src/lib/supabaseClient.ts` — client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (`.env.local`, gitignored; `.env.example` documents the shape).
- `src/hooks/useMovies.ts` — data-access hook: fetch on mount, `addMovie`, `updateMovie`, `deleteMovie`, `toggleWatched`, `resetToSeed`, plus `loading`/`error` state. Not yet updated to read/write `genre`/`decade`/`rank`/cast (follow-up).

## Established via

`changes/archive/halloween-supabase-crud/`, extended by `changes/archive/halloween-mysql-import/` (schema + one-time data import from a local WAMP MySQL `movieslist` DB — 36 movies, 120 actors, 150 cast links, researched/verified rather than copied from the messy source cast data).
