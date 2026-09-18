# Design

## Schema

```sql
create table public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year integer,
  added_by text not null check (added_by in ('Me', 'Wife', 'Both')),
  rating integer not null check (rating between 1 and 5),
  watched boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);
```

- `id`: DB-generated UUID, replaces the client-side `crypto.randomUUID()` currently used in `App.tsx`.
- `year`: nullable integer. The frontend's `Movie.year` is `number | ''`; the data layer converts `''` <-> `null` at the Supabase boundary so the rest of the UI is untouched.
- `added_by`: kept as a `check` constraint instead of a Postgres enum type — easier to change later, matches the existing TS union `'Me' | 'Wife' | 'Both'`.
- `rating`: `check` constraint (1-5) instead of enforcing only in the UI, so bad data can't land in the table even from a stray API call.
- `notes`: `not null default ''` so the frontend never has to special-case `null` vs `''`.
- No `updated_at`/triggers — not needed for a two-person hobby list; can be added later if it matters.

## RLS policy

RLS is enabled (Supabase requires this to avoid a security advisor warning) but with a single permissive policy allowing all operations to the `anon` role, since there's no login:

```sql
alter table public.movies enable row level security;

create policy "public read/write (no auth in this app)"
  on public.movies
  for all
  to anon
  using (true)
  with check (true);
```

This is the "no login, shared open list" tradeoff from the proposal, spelled out here so it's easy to find and revisit if the app ever needs real accounts.

## Client wiring

- `src/lib/supabaseClient.ts` creates a single `supabase` client from `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- `.env.local` (gitignored via the existing `*.local` rule) holds the real values; `.env.example` (committed) documents the two variable names with placeholder values.
- `src/hooks/useMovies.ts` replaces `useLocalStorage<Movie[]>`: fetches all movies on mount, exposes `addMovie`, `updateMovie`, `deleteMovie`, `toggleWatched`, `resetToSeed`, plus `loading`/`error` state. All mutations optimistically update local state and re-sync from the mutation's response so the UI stays snappy without needing realtime subscriptions (out of scope — single-tab-at-a-time usage is fine for this app).
- `resetToSeed` deletes all rows then bulk-inserts `seedMovies` (mapping `year: ''` to `null` and letting Supabase generate new `id`s).

## Non-goals

- Multi-user auth / accounts.
- Realtime sync between simultaneously open tabs/devices (would need Supabase Realtime subscriptions — not needed for how this app is actually used).
- Offline support / localStorage fallback (explicitly ruled out in favor of Supabase as the single source of truth).
