# Tasks

## 1. OpenSpec

- [x] 1.1 Write proposal.md, design.md, tasks.md for `halloween-drag-drop-ranking`

## 2. Data layer

- [x] 2.1 Add `reorderMovies(orderedIds: string[])` to `src/hooks/useMovies.ts`: compute sequential ranks from array position (top = 1, counting up), optimistically update local `movies` state, persist via one `update({ rank }).eq('id', id)` call per row (in parallel via `Promise.all`) — not a single `upsert`, since a partial-column upsert would trip NOT NULL constraint checks on the insert branch (see design.md)
- [x] 2.2 On any row's update error, set `error` state and revert to the pre-drag order
- [x] 2.3 Update `src/hooks/useMovies.test.ts` with coverage for `reorderMovies` (rank computation, optimistic update, revert-on-error)
- [x] 2.4 Flip `refresh()`'s sort to `.order('rank', { ascending: true, nullsFirst: false })` — Jace flagged that a big list's top card showed the largest rank number (e.g. "#40 fave"), which read backwards; `rank = 1` should be the top favorite at the top of the list

## 3. Drag-and-drop UI

- [x] 3.1 ~~Add a drag-handle element~~ Make the whole card draggable — a handle-only design didn't work in Jace's manual test (grabbing the card body did nothing), so the drag-handle restriction was removed; any point on the card starts a drag
- [x] 3.2 Wire native HTML5 drag events (`onDragStart`/`onDragEnter`/`onDragOver`/`onDrop`/`onDragEnd`) on the `<li>` inside `MovieCard`, driven by drag-state/handlers passed down from `App.tsx`, gated on `filter === 'all'`
- [x] 3.3 Track drag state (`draggedId`, `overId`) in `App.tsx` for visual feedback (`dragging`/`drop-target` classes) during drag-over
- [x] 3.4 On drop, compute the new id order and call `reorderMovies`
- [x] 3.5 Disable the `draggable` attribute (and skip drag handlers) when filter is `unwatched` or `watched`
- [x] 3.6 `App.css`: `cursor: grab`/`grabbing` on the card, and drop-target highlight
- [x] 3.7 Move the rank badge to the front of the title row (top-left of the card) instead of grouped with the added-by badge on the right

## 3a. Color theme

- [x] 3a.1 Replace the orange/purple accent tokens in `src/index.css` with a dark-blue-based palette (`--accent`/`--accent-dark` navy blue, `--accent-secondary` teal) per Jace's request; also reworked the purple-tinted neutral `--text`/`--text-muted`/`--border`/`--shadow` tokens to a blue-slate tint
- [x] 3a.2 Update all `var(--orange)`/`var(--orange-dark)`/`var(--purple)` references in `src/App.css` to the new `--accent`/`--accent-dark`/`--accent-secondary` tokens

## 3b. Rank-gap closing on removal

Jace hit this in manual testing: deleting the #1 favorite left the new top card still labeled "#2" — #1 became permanently unreachable. Root cause: once a drag reorder makes `rank` a dense `1..N` sequence, removing one movie from that sequence (delete, or clearing its rank via edit) needs to shift everyone below it up by one, and nothing did that.

- [x] 3b.1 Add `closeRankGap(currentMovies, vacatedRank)` to `src/hooks/useMovies.ts`: decrements the rank of every movie ranked below `vacatedRank`, applies it optimistically, persists via one `update({ rank }).eq('id', id)` call per affected row (same per-row-update approach as `reorderMovies`, same NOT-NULL reasoning)
- [x] 3b.2 `deleteMovie`: look up the deleted movie's rank before deleting; if it had one, call `closeRankGap` with the post-delete list. Deleting an unranked movie is unaffected (no gap to close)
- [x] 3b.3 `updateMovie`: when a movie's rank goes from a number to `null` (cleared via the edit form), call `closeRankGap` the same way. Editing to a *different* non-null number is left alone (documented non-goal — self-heals on next drag)
- [x] 3b.4 On a `closeRankGap` persistence failure, call `refresh()` to resync from the server's actual state, then re-apply the error message afterward (calling `refresh()` alone would silently clear `error` via its own success path)
- [x] 3b.5 `App.tsx`: clear `draggedId`/`overId` in the delete handler if either referenced the deleted card, and unconditionally in the reset-to-starter-list handler, so drag state can't dangle on an id that no longer exists
- [x] 3b.6 Tests: `useMovies.test.ts` covers `closeRankGap` via both `deleteMovie` (shifts ranks down, skips when deleting unranked, surfaces error + resyncs on persist failure) and `updateMovie` (shifts on un-rank, does *not* shift on a normal edit); `App.test.tsx` covers drag-state clearing on mid-drag delete

## 4. Tests

- [x] 4.1 Update `src/App.test.tsx` and `src/components/MovieCard.test.tsx` for drag-from-anywhere-on-the-card initiation and filter-gated draggable behavior

## 5. Verification

- [x] 5.1 `npm run build` passes
- [x] 5.2 `npm run lint` passes (same 2 pre-existing warnings as before, unrelated to this change)
- [x] 5.3 `npm test` passes (63/63, including reorder/drag/rank-gap-closing coverage)
- [ ] 5.4 Manually verify in-browser: drag a card up/down within "All", confirm rank badges update and persist across reload; confirm dragging is disabled under "Unwatched"/"Watched"; delete the #1 favorite and confirm the old #2 becomes #1 (not a dangling #2). Note: no browser automation tool was available in this session (Claude in Chrome extension not connected), so this was not independently verified by the agent — dev server can be started with `npm run dev` for a manual look.
- [ ] 5.5 Jace confirms it looks/feels right before archiving

## 6. Documentation

- [x] 6.1 Update `openspec/specs/movie-crud.md`'s "Sort"/"Delete"/"Display" behavior to describe drag-to-reorder, the rank direction, and gap-closing on delete/un-rank
- [x] 6.2 Update Confluence CoastNCode project log (drag-and-drop + rank-direction flip + orange/purple dislike logged after the first round; delete/rank-gap fix logged after this round)
- [ ] 6.3 Move this change folder to `openspec/changes/archive/`
