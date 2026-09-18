# Design

## Schema changes

```sql
alter table public.movies
  drop constraint movies_rating_check,
  add constraint movies_rating_check check (rating between 0 and 10);

alter table public.movies
  add column genre text,
  add column decade text,
  add column rank integer;

create table public.actors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.movie_actor (
  movie_id uuid not null references public.movies(id) on delete cascade,
  actor_id uuid not null references public.actors(id) on delete cascade,
  primary key (movie_id, actor_id)
);

alter table public.actors enable row level security;
alter table public.movie_actor enable row level security;

create policy "public read/write (no auth in this app)"
  on public.actors for all to anon using (true) with check (true);

create policy "public read/write (no auth in this app)"
  on public.movie_actor for all to anon using (true) with check (true);
```

- `rating`: constraint widened 0-10 (was 1-5). `rating` stays nullable-by-convention-only (column is `not null` today; migrated rows get `rating = 0` as a neutral "not yet scored" default, matching existing not-null-ness — see Data mapping below). Existing 4 seed rows are unaffected.
- `rank`: nullable integer, no upper bound (unlike a 1-5/0-10 rating, it's an open-ended ordering position that grows as movies are added). Not unique-constrained — ties are fine.
- `genre`, `decade`: nullable text, free-form (matches source data, no enum).
- `actors.name`: no uniqueness constraint at the DB level; de-duplication is handled at import time (see Data mapping) since it's a one-time cleanup pass, not an ongoing invariant worth enforcing yet.
- `movie_actor`: composite PK on `(movie_id, actor_id)`, `on delete cascade` both ways so removing a movie or actor cleans up links automatically.
- RLS: same open `anon` policy pattern as `movies` (see `movies-backend` spec) — no auth in this app.

## Data mapping (MySQL `movieslist` → Supabase `halloweenMovies`)

Source scope: `movies` rows where `holiday = 'Halloween' OR holiday IS NULL` (39 of 60 rows; Christmas-tagged rows excluded). `movie_actor` / `actors` from the source DB are **not** copied — replaced with freshly researched cast (see below).

| Supabase column | Source | Notes |
|---|---|---|
| `id` | new `gen_random_uuid()` | source `bigint` ids are only used to correlate rows during the import script, not stored |
| `title` | `movies.title` | as-is |
| `year` | — | source has no `year` column; left `null` |
| `added_by` | — | source has no equivalent; defaulted to `'Both'` since this is a batch import of a shared existing list, not either person picking individually |
| `genre` | `movies.genre` | as-is |
| `decade` | `movies.decade` | `'1990'` corrected to `'1990s'` (id 63, "Garfield halloween") |
| `rating` | — | left at `0` (the "not yet scored" default) for all migrated rows — this is the fresh 0-10 scale Jace and his wife assign themselves going forward, not derived from source data |
| `rank` | `movies.rating` | copied as-is (the source's 0-21 column was functioning as a favorites ranking, not a rating) |
| `watched` | — | defaulted `false` — source has no watched-status equivalent |
| `notes` | `movies.description` | source "description" actually held watch-timing notes (`Day`, `Week`, `Month (Bri priority)`, `TBD`, ...), folded into `notes` as-is; `null` → `''` |
| `created_at` | — | defaults to `now()` at insert time |

Cast (`actors` / `movie_actor`): researched fresh per movie (top 3-5 billed cast, verified via web search) rather than copied from the source, because the source cast data was sparse (~20 of 39 movies had any links) and messy (duplicate actor rows per person, e.g. "Andy Samberg" under 4 different ids; some rows crammed multiple names into one field). Actor names de-duplicated case-insensitively across the whole import so e.g. an actor appearing in 3 different movies gets one `actors` row and 3 `movie_actor` links.

## Existing-row overlap

The live Supabase table already has 4 rows (manually added, with real `watched`/`rating`/`notes` data): Beetlejuice, "delet" (a test row), Hocus Pocus, and The Nightmare Before Christmas. Three of those titles are also in the 39-movie import list. To avoid duplicating rows with real user data, those 3 titles are **excluded from the import** (36 of the 39 movies are inserted, not 39) — their existing Supabase rows are left untouched, including their `watched`/`rating`/`notes` values. The "delet" test row is left as-is; not this change's concern.

## Non-goals

- No frontend UI changes in this change — `genre`/`decade`/`rank`/cast are populated in the backend but not yet surfaced in `MovieCard`/`MovieForm`. Follow-up change once the data is in and Jace has seen it in Supabase.
- The local MySQL `movieslist` database is not modified or deleted — read-only source for this one-time import.
