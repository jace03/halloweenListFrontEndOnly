# Tasks

## 1. OpenSpec

- [x] 1.1 Write proposal.md, design.md, tasks.md for `halloween-mysql-import`

## 2. Source inspection (local WAMP MySQL)

- [x] 2.1 Connect to local `movieslist` MySQL DB, inventory tables
- [x] 2.2 Inspect `movies`/`actors`/`movie_actor` schemas and row counts
- [x] 2.3 Extract Halloween-filtered movie list (39 rows), confirm rating distribution and decade/description data quality issues
- [x] 2.4 Identify overlap with existing 4 Supabase rows (Beetlejuice, Hocus Pocus, The Nightmare Before Christmas)

## 3. Cast research

- [x] 3.1 Research and verify top 3-5 billed cast per movie for all 39 titles

## 4. Supabase schema migration

- [x] 4.1 Widen `movies.rating` check constraint to 0-10
- [x] 4.2 Add `genre`, `decade`, `rank` columns to `movies`
- [x] 4.3 Create `actors` and `movie_actor` tables with `on delete cascade` FKs
- [x] 4.4 Enable RLS + open anon policy on `actors` and `movie_actor`
- [x] 4.5 Verify `get_advisors` (security) shows no new missing-RLS warnings — confirmed 0 lints

## 5. Data import

- [x] 5.1 Insert 36 movies (39 minus 3 overlapping titles) with mapped fields (genre, decade-corrected, rank = old rating, rating = 0, added_by = 'Both', watched = false, notes = old description)
- [x] 5.2 Insert de-duplicated actors from research pass (120 actors)
- [x] 5.3 Insert `movie_actor` links (150 links)
- [x] 5.4 Verify row counts: 36 new movies (40 total), 120 actors, 150 movie_actor links — confirmed

## 6. Wrap-up

- [x] 6.1 Spot-check a few imported rows (rank order, genre/decade, cast) against source/research
- [x] 6.2 Update `openspec/specs/movies-backend.md` (schema) and note the new capability surface
- [x] 6.3 Move this change folder to `openspec/changes/archive/` once verified
