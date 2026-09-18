# Proposal

## Why

`halloween-mysql-import` expanded the Supabase `movies` schema (0-10 `rating`, `genre`, `decade`, `rank`, and the `actors`/`movie_actor` cast tables) and backfilled 36 imported movies, but the frontend still only knew about the original title/year/added_by/rating(1-5)/watched/notes shape. The new fields existed in the database but were invisible in the app. This change brings the UI up to date with the backend it already has.

## What Changes

- `MovieForm`: rating input changes from a 1-5 pumpkin `<select>` to a 0-10 range slider (label shows `n/10` or "unrated" at 0); adds `genre` and `decade` text inputs (with `<datalist>` suggestions drawn from the imported data's existing values) and a `rank` number input (blank = unranked).
- `MovieCard`: shows genre/decade as small tags, a rank badge (`#N fave`) next to the existing added-by badge when `rank` is set, the rating as `🎃 n/10` (or "Not rated yet" when 0), and a cast line when the movie has linked actors.
- `useMovies`: fetches movies with cast via a nested Supabase select (`movie_actor(actors(name))`), maps it to a flat `cast: string[]`, and now orders the list by `rank` (descending, nulls last) then `created_at` — favorites surface at the top, matching the intent behind adding `rank` in the first place.
- `seedMovies` / "Reset to starter list" updated with genre/decade for the 3 starter movies so the reset flow still produces valid, complete rows.

## Capabilities

### Modified Capabilities
- `movie-crud`: add/edit flows now cover genre/decade/rank/0-10 rating; list view now shows cast and sorts by favorite rank.

## Impact

- Affects: `src/types.ts`, `src/hooks/useMovies.ts`, `src/components/MovieForm.tsx`, `src/components/MovieCard.tsx`, `src/App.css`, `src/data/seedMovies.ts`.
- No schema changes (this change consumes what `halloween-mysql-import` already added).
- Verified: `npm run build` and `npm run lint` pass; the exact Supabase queries the app now runs (nested cast select + rank ordering, and an insert/delete round-trip matching the form's new field shape) were hit directly against the live `halloweenMovies` project and returned correct data. Browser-based click-through was not available this session (no browser automation tool connected) — Jace should give the dev server (`npm run dev`) a look before trusting this fully, especially the range-slider rating control.