# Design

## Drag mechanism

- Native HTML5 drag-and-drop API (`draggable`, `onDragStart`, `onDragEnter`, `onDragOver`, `onDrop`, `onDragEnd`) on the `<li className="movie-card">` that `MovieCard` itself renders — no new dependency, consistent with the rest of the project's plain-CSS/no-extra-libs approach. `App.tsx` passes down `draggable`/`isDragging`/`isDropTarget` booleans and the drag callbacks as props; `MovieCard` wires the DOM event handlers.
- The whole card is grabbable — the `<li>` is `draggable` with no restriction on where the drag starts (an earlier handle-only-initiation design was dropped after Jace tried grabbing the card body and it didn't respond; native buttons/inputs/labels inside the card still consume their own mousedown for clicks, so Edit/Delete/the watched checkbox keep working normally). `cursor: grab`/`grabbing` on the card communicates it's draggable.
- `App.tsx` tracks the dragged movie's id and the current drag-over index in local state (`draggedId`, `overIndex`) purely for visual feedback (e.g. a highlighted drop line); the actual reorder is computed on `onDrop`.
- Desktop mouse only: no `touchstart`/`touchmove` handling in this pass. Native HTML5 DnD does not work on touch devices anyway, so this is a natural v1 boundary rather than an extra restriction to build.

## Reorder + rank recompute

- On drop, build the new ordered array of movie ids (move the dragged id from its old index to the new index within `movies`, not just `visibleMovies`, since drag is only enabled when filter is "All" and at that point `visibleMovies === movies`).
- Recompute rank for the *entire* list sequentially, counting from the top: the top card gets `rank = 1`, the next gets `2`, ... down to `movies.length` for the bottom card — a "#1 fave" reads as the actual favorite, matching how a countdown/top-N list is normally read. `useMovies`'s `refresh()` sorts `.order('rank', { ascending: true, nullsFirst: false })` (flipped from the original descending sort in `halloween-ui-expansion`) so the saved ranks immediately reproduce the same order on next load.
- This means once a list has been reordered via drag at least once, every movie has a concrete rank (no more `null`/unranked movies) — previously-unranked movies dragged into place simply receive whatever sequential number their new position implies. This is called out in the proposal as an intentional behavior change.
- Add `reorderMovies(orderedIds: string[])` to `useMovies`:
  - Computes `{ id, rank }` pairs from the array position.
  - Applies an optimistic local update to `movies` state immediately (so the UI reflects the drop with no delay/flicker).
  - Persists with one `supabase.from('movies').update({ rank }).eq('id', id)` call per row, run in parallel via `Promise.all` (deliberately not a single `upsert`: PostgREST's upsert builds an `INSERT ... ON CONFLICT DO UPDATE`, and Postgres validates NOT NULL columns like `title`/`added_by` against the proposed insert row before it even checks for a conflict — so a partial-column upsert with just `id`/`rank` would fail even though every row already exists and only an UPDATE is intended). On any row's error, sets `error` state and reverts local state to the pre-drag snapshot so the UI never shows a rank order that didn't actually save.

## Removal & rank-gap closing

Once `rank` is a dense `1..N` sequence (the state any drag reorder produces), removing a ranked movie from that sequence — by deleting it, or by editing it back to unranked — leaves a hole unless something closes it. Jace hit this directly: deleting the #1 favorite left the new top card still labeled "#2", and no card ever showed "#1" again.

- `useMovies` gets a shared `closeRankGap(currentMovies, vacatedRank)` helper used by both `deleteMovie` and `updateMovie`:
  - Finds every movie in `currentMovies` with a rank greater than `vacatedRank` and decrements each by 1 (movies with a lower rank, or no rank, are untouched).
  - Applies the shift to local state immediately (optimistic), then persists it with one `update({ rank }).eq('id', id)` call per affected row via `Promise.all` — the same per-row-update approach as `reorderMovies`, for the same NOT-NULL-constraint reason.
  - If a persist call fails, the delete/edit itself already succeeded server-side (it's a separate earlier request), so there's no clean local rollback. Instead it calls `refresh()` to resync from the server's actual state, then re-applies the error message afterward (since `refresh()`'s own success path clears `error`, simply calling it would silently swallow the failure).
- `deleteMovie` looks up the deleted movie's rank *before* deleting (from the current `movies` state), issues the delete, and — only if that movie had a non-null rank — calls `closeRankGap` with the post-delete list and that rank. Deleting an unranked movie skips the gap-close entirely (nothing to shift).
- `updateMovie` compares the previous rank (from state, before the request) to the rank in the server's response after saving. It only calls `closeRankGap` when a movie transitions from ranked to unranked (i.e., the "Favorite rank" field was cleared in the edit form) — any other rank edit (changing it to a different non-null number) is left alone, per the existing manual-rank non-goal below.
- `App.tsx`'s delete handler also clears `draggedId`/`overId` if either referenced the just-deleted card, and the reset-to-starter-list handler clears both unconditionally, so drag state never dangles on an id that no longer exists in the list.

## Rank badge placement

- The rank badge (`#N`) moves from the right side of the card header (grouped with the added-by badge) to the front of the title row, so it reads as the top-left element of the card — the first thing visible, ahead of the movie title. `MovieCard`'s header is now a `.title-row` (rank badge + `<h3>`) on the left and the added-by `.badge-group` on the right, same flex layout as before.

## Filter interaction

- `App.tsx` only wires up the drag handlers (and only renders the drag handle as interactive) when `filter === 'all'`. When `filter` is `'unwatched'` or `'watched'`, `MovieCard` renders without `draggable`/the handle disabled (e.g. reduced opacity, no grab cursor) so it's visually clear reordering isn't available there.
- No change to the filter logic itself (`visibleMovies` memo) — this only gates whether drag handlers attach.

## Color palette

- Jace dislikes both the orange and purple accent colors from the original Halloween theme; they're replaced with a dark-blue-based palette. `index.css` renames the accent tokens: `--orange`/`--orange-dark` → `--accent`/`--accent-dark` (dark navy blue, e.g. `#1f3b57` light / `#5b9bd5` dark-mode for contrast against the dark background), and `--purple` → `--accent-secondary` (a complementary deep teal, `#0f6674` light / `#4fd1c5` dark-mode), used for `.btn-link` text and the "Both" added-by badge. The neutral `--text`/`--text-muted`/`--border`/`--shadow` tokens, which previously had a purple tint (e.g. `--text: #2c1a3d`), are also reworked to a blue-slate tint for consistency. `--bg`/`--surface` (the warm cream/white backdrop) are unchanged — only the purple/orange hues are gone, not the overall light/dark theming structure.
- `App.css` references were updated 1:1 (`var(--orange)` → `var(--accent)`, `var(--orange-dark)` → `var(--accent-dark)`, `var(--purple)` → `var(--accent-secondary)`); no selector or layout changes. The hardcoded `.badge-me` (blue) and `.badge-wife` (pink) colors are untouched.

## Non-goals

- No touch/mobile drag gestures.
- No partial-list (filtered) reordering.
- No new columns/schema — `rank` is reused as-is; it just becomes fully populated after first use of drag reordering.
- No change to `MovieForm`'s manual rank input, and no uniqueness/range validation added to it — typing an already-used or out-of-range rank number can still produce a duplicate or a gap; the next drag anywhere in the list recomputes every rank from scratch and self-heals it. Only removal (delete, or editing a rank back to blank) gets automatic gap-closing, since that's the specific case that leaves a permanently unreachable number rather than a transient inconsistency.
- No change to the Halloween emoji/copy or the pumpkin/ghost branding — only the orange/purple accent colors move.
- No fix for concurrent multi-tab/multi-user rank edits (no login, shared anon access) — pre-existing tradeoff, not introduced or worsened by this change.
