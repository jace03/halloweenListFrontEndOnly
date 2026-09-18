# Capability: movie-crud

Add/edit/delete/toggle-watched flows for the Halloween watchlist, backed by `movies-backend`.

## Behavior

- **Add**: form at the top of the app inserts a new row via `useMovies().addMovie`; appears in the list immediately. Fields: title, year, picked-by, 0-10 rating (range slider, "unrated" at 0), genre, decade (free text with suggestions), favorite rank (optional number), watched, notes.
- **Edit**: "Edit" on a movie card loads it into the form; "Save changes" updates the row via `useMovies().updateMovie`.
- **Toggle watched**: checkbox on the movie card flips `watched` via `useMovies().toggleWatched` without opening the edit form.
- **Delete**: "Delete" on a movie card removes the row via `useMovies().deleteMovie`, immediate and permanent. If the deleted movie had a rank, every movie ranked below it shifts up by one (its rank number decreases by 1) so the remaining ranks stay a dense, gapless sequence starting at 1 — deleting the #1 favorite promotes the old #2 to #1, not to a dangling #2.
- **Filter**: All / Unwatched / Watched, client-side filter over the fetched list.
- **Sort**: list is ordered by favorite `rank` ascending — `rank = 1` is the top favorite and appears first, counting up going down the list; unranked movies last — then by when they were added.
- **Reorder via drag-and-drop**: cards can be dragged, but only by grabbing a dedicated dots handle (⋮⋮) on the side of the card — pressing down anywhere else on the card no longer starts a drag. Dragging is only available while the "All" filter is active *and* the list layout is set to 1 column (see Display); dropping recomputes sequential `rank` values (top card = 1, counting up) for every movie to match the new order and persists them via `useMovies().reorderMovies`, including assigning a rank to a previously-unranked movie dropped into the list. Disabled while the "Unwatched"/"Watched" filter is active, or while 2/3/4 columns are selected.
- **Un-ranking via edit**: clearing a movie's "Favorite rank" field back to blank in the edit form has the same gap-closing effect as deleting a ranked movie — every movie ranked below it shifts up by one. Editing a rank to a *different* number (not blank) does not auto-shift anything; typing an already-used or out-of-range number can leave a duplicate or gap until the next drag reorder recomputes every rank from scratch.
- **Display**: each card shows a poster thumbnail (auto-fetched from TMDB, or a 🎃 placeholder if no match), a rank badge (`#N`) at the front of the title row when ranked, genre/decade tags, the 0-10 rating (⭐), and a cast line (read-only — actors are linked via `movies-backend`'s `movie_actor` table but not editable from the UI yet). The list renders as a CSS grid with a user-selectable column count (1/2/3/4, toggle buttons in the list toolbar), persisted in `localStorage` across reloads; below the 561px mobile breakpoint the grid always collapses to 1 column regardless of the stored preference. The underlying list is still one linear rank-ordered sequence — the grid just wraps it into N columns for display — so there is no per-column or 2D reordering.
- **Poster fetch**: on add, and on edit when the title or year changes, `useMovies()` calls TMDB's search API (`src/lib/tmdb.ts`, `VITE_TMDB_API_KEY`) for a matching poster and stores its URL on the row; failures/no-match leave `poster_url` null and the card falls back to the placeholder.

## Established via

`changes/archive/halloween-supabase-crud/`, verified end-to-end in-browser by Jace on 2026-09-18. Extended by `changes/archive/halloween-ui-expansion/` (genre/decade/rank/cast display, 0-10 rating) — data layer verified directly against the live Supabase project; full in-browser click-through pending Jace's confirmation (no browser automation tool available during that session).
