# Capability: movie-crud

Add/edit/delete/toggle-watched/reset flows for the Halloween watchlist, backed by `movies-backend`.

## Behavior

- **Add**: form at the top of the app inserts a new row via `useMovies().addMovie`; appears in the list immediately. Fields: title, year, picked-by, 0-10 rating (range slider, "unrated" at 0), genre, decade (free text with suggestions), favorite rank (optional number), watched, notes.
- **Edit**: "Edit" on a movie card loads it into the form; "Save changes" updates the row via `useMovies().updateMovie`.
- **Toggle watched**: checkbox on the movie card flips `watched` via `useMovies().toggleWatched` without opening the edit form.
- **Delete**: "Delete" on a movie card removes the row via `useMovies().deleteMovie`, immediate and permanent. If the deleted movie had a rank, every movie ranked below it shifts up by one (its rank number decreases by 1) so the remaining ranks stay a dense, gapless sequence starting at 1 — deleting the #1 favorite promotes the old #2 to #1, not to a dangling #2.
- **Filter**: All / Unwatched / Watched, client-side filter over the fetched list.
- **Sort**: list is ordered by favorite `rank` ascending — `rank = 1` is the top favorite and appears first, counting up going down the list; unranked movies last — then by when they were added.
- **Reorder via drag-and-drop**: while the "All" filter is active, cards can be dragged (grab anywhere on the card, desktop mouse only) to a new position; dropping recomputes sequential `rank` values (top card = 1, counting up) for every movie to match the new order and persists them via `useMovies().reorderMovies`, including assigning a rank to a previously-unranked movie dropped into the list. Disabled while the "Unwatched"/"Watched" filter is active.
- **Un-ranking via edit**: clearing a movie's "Favorite rank" field back to blank in the edit form has the same gap-closing effect as deleting a ranked movie — every movie ranked below it shifts up by one. Editing a rank to a *different* number (not blank) does not auto-shift anything; typing an already-used or out-of-range number can leave a duplicate or gap until the next drag reorder recomputes every rank from scratch.
- **Display**: each card shows a rank badge (`#N`) at the front of the title row when ranked, genre/decade tags, the 0-10 rating, and a cast line (read-only — actors are linked via `movies-backend`'s `movie_actor` table but not editable from the UI yet).
- **Reset to starter list**: confirmation prompt, then `useMovies().resetToSeed` deletes all rows and bulk-inserts `src/data/seedMovies.ts` with fresh server-generated IDs.

## Established via

`changes/archive/halloween-supabase-crud/`, verified end-to-end in-browser by Jace on 2026-09-18. Extended by `changes/archive/halloween-ui-expansion/` (genre/decade/rank/cast display, 0-10 rating) — data layer verified directly against the live Supabase project; full in-browser click-through pending Jace's confirmation (no browser automation tool available during that session).
