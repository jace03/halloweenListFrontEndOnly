# Proposal

## Why

Jace has an older Laravel + MySQL "movieslist" app running locally on WAMP with a richer Halloween/Christmas movie collection (60 movies, genres, decades, cast, and an existing favorites ranking) built up over time. He wants that data folded into the live `halloweenMovies` Supabase project so it's not stranded on one machine, and wants the schema to grow to support genre/decade/cast/rank alongside the existing add/edit/delete/watched workflow.

## What Changes

- **Widen `rating`**: existing 1-5 check constraint becomes 0-10, matching the finer-grained scale Jace and his wife want to use going forward. Existing seed rows (1-5) remain valid under the wider range; UI changes from repeated 🎃 pumpkins to a numeric/slider display.
- **Add `rank`**: new nullable integer column, a separate concept from `rating` — an open-ended "order of favorite" position (higher = closer to the top of the list) that grows as more movies are added. Seeded from the old MySQL app's `rating` column, which was actually being used as this kind of ranking for the top movies.
- **Add `genre`, `decade`**: new nullable text columns, carried over from the MySQL source.
- **No `holiday` column**: this app is Halloween-only by design (see `README.md`), so only Halloween-tagged rows are imported; Christmas-tagged rows are left behind in the source DB.
- **Old `description` column folded into existing `notes`**: the MySQL "description" field didn't actually hold synopses — it held ad hoc watch-timing notes (`Day`, `Week`, `Month (Bri priority)`, `TBD`, etc.). Rather than add a new field for this, its values are migrated into the movies table's existing free-text `notes` column.
- **Add `actors` and `movie_actor` tables**: many-to-many cast tracking so movies can later be filtered/browsed by favorite actor. The source DB's actor data was messy (duplicate rows per actor, multi-name fields) and sparse (cast only recorded for ~20 of 39 movies), so cast is being freshly researched and verified for all 39 migrated movies rather than copied as-is.
- **One-time data import**: 39 Halloween movies (of 60 total in the source; Christmas movies excluded) migrated from local MySQL `movieslist` into Supabase, with cleaned-up decade values and researched cast links. The source MySQL database is left untouched (read-only import).

## Capabilities

### Modified Capabilities
- `movies-backend`: schema grows (genre, decade, rank, wider rating range) and gains `actors`/`movie_actor` tables.
- `movie-crud`: rating input/display changes from 1-5 pumpkins to 0-10; UI eventually needs genre/decade/rank/cast fields (tracked as follow-up, not required for this data-only import).

## Impact

- Affects: `public.movies` schema (Supabase), new `public.actors` / `public.movie_actor` tables, one-time data migration. No `src/` frontend code changes in this change — the UI continues to work against the existing fields; surfacing the new fields (genre/decade/rank/cast) in the UI is a follow-up change.
- Source: local WAMP MySQL `movieslist` database (Laravel app), read-only — `movies`, `actors`, `movie_actor` tables. Framework tables (`migrations`, `jobs`, `cache`, etc.) are not touched or migrated.
- Data quality fixes applied during import: `decade` typo (`'1990'` → `'1990s'`) corrected; cast freshly researched and verified rather than copied from the sparse/duplicated source `actors`/`movie_actor` data.
