# Capability: movie-crud

Add/edit/delete/toggle-watched/reset flows for the Halloween watchlist, backed by `movies-backend`.

## Behavior

- **Add**: form at the top of the app inserts a new row via `useMovies().addMovie`; appears in the list immediately. Fields: title, year, picked-by, 0-10 rating (range slider, "unrated" at 0), genre, decade (free text with suggestions), favorite rank (optional number), watched, notes.
- **Edit**: "Edit" on a movie card loads it into the form; "Save changes" updates the row via `useMovies().updateMovie`.
- **Toggle watched**: checkbox on the movie card flips `watched` via `useMovies().toggleWatched` without opening the edit form.
- **Delete**: "Delete" on a movie card removes the row via `useMovies().deleteMovie`, immediate and permanent.
- **Filter**: All / Unwatched / Watched, client-side filter over the fetched list.
- **Sort**: list is ordered by favorite `rank` (highest first, unranked movies last), then by when they were added.
- **Display**: each card shows genre/decade tags, a rank badge when ranked, the 0-10 rating, and a cast line (read-only — actors are linked via `movies-backend`'s `movie_actor` table but not editable from the UI yet).
- **Reset to starter list**: confirmation prompt, then `useMovies().resetToSeed` deletes all rows and bulk-inserts `src/data/seedMovies.ts` with fresh server-generated IDs.

## Established via

`changes/archive/halloween-supabase-crud/`, verified end-to-end in-browser by Jace on 2026-09-18. Extended by `changes/archive/halloween-ui-expansion/` (genre/decade/rank/cast display, 0-10 rating) — data layer verified directly against the live Supabase project; full in-browser click-through pending Jace's confirmation (no browser automation tool available during that session).
