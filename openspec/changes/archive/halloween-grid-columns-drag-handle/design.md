# Design

## Column layout

### State & persistence

- New `columns` state in `App.tsx`: `1 | 2 | 3 | 4`, initialized from `localStorage.getItem('movie-list-columns')` (parsed, falling back to `1`), written back on every change. Same pattern as other lightweight client-only preferences in this app (no Supabase column needed — this is display-only and per-browser, matching how `filter` already behaves as transient UI state, except persisted).
- Toolbar gets a second button group next to the All/Unwatched/Watched filter: four buttons labeled `1`, `2`, `3`, `4`, `active` class on the selected one, same visual language as the existing `filter-btn`s (reuse the class or add a sibling `column-btn` class with the same base styles).

### Grid CSS

`movie-list` moves from a flex column to a CSS grid, with the column count expressed via a `data-columns` attribute on the `<ul>` rather than an inline style, so the mobile breakpoint can simply not have a rule for it (no `!important` needed to fight an inline style):

```css
.movie-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 561px) {
  .movie-list[data-columns='2'] { grid-template-columns: repeat(2, 1fr); }
  .movie-list[data-columns='3'] { grid-template-columns: repeat(3, 1fr); }
  .movie-list[data-columns='4'] { grid-template-columns: repeat(4, 1fr); }
}
```

Below 561px (the existing mobile breakpoint in `App.css`), there's no matching selector so it stays the base single-column grid regardless of `data-columns` — no JS-side "force 1 column on mobile" logic needed, and the column toggle buttons themselves can stay visible-but-inert on mobile (or be hidden via the same media query) since they simply have no visual effect until the viewport widens.

`.movie-card` keeps its internal `display: flex` (poster + body side by side) — that's independent of how the outer `<ul>` lays out cards relative to each other, so no changes needed there beyond adding the handle (below).

## Drag-handle-only initiation

### Why the first attempt (halloween-drag-drop-ranking, task 3.1) was abandoned

That change's tasks.md records: *"Add a drag-handle element ~~struck through~~ Make the whole card draggable — a handle-only design didn't work in Jace's manual test (grabbing the card body did nothing)."* Reading between the lines, the likely implementation was `draggable` set only on the small handle sub-element while the `<li>` itself was not draggable — which means grabbing the *card body* correctly did nothing (working as designed for a handle-only interaction), but probably felt broken/undiscoverable with no visual affordance pointing at the handle, and/or the handle's drag image was just the tiny handle icon rather than the whole card, which looks wrong. It was simpler at the time to make the whole card draggable and move on.

### This attempt's approach

Keep the `<li className="movie-card">` itself `draggable` (so the browser's default drag image is the whole card, not a tiny icon), but gate whether a drag is allowed to start on *where the mouse went down*, not on which element has the `draggable` attribute:

- Add a `handlePressed` ref (`useRef(false)`) in `MovieCard`.
- The handle element (`<span className="drag-handle" aria-hidden="true">⋮⋮</span>`, positioned at the left edge of the card via flexbox, before the poster) gets `onMouseDown={() => { handlePressed.current = true }}`.
- `onDragStart` on the `<li>` checks `handlePressed.current`; if false, calls `event.preventDefault()` and returns (no drag starts). If true, proceeds exactly as today (`onDragStart?.(movie.id)`).
- Reset `handlePressed.current = false` on `onDragEnd` and on a global `onMouseUp` (covers the case where the user mouses down on the handle but releases without dragging, e.g. a stray click) — a simple `window.addEventListener('mouseup', ...)` in a `useEffect`, or simpler: reset it in both `onDragEnd` and the handle's own `onMouseUp`.
- The handle is only rendered/interactive when `draggable` is true (same prop that already gates the whole card today), so it naturally disappears when dragging is unavailable (wrong filter or >1 column — see below).
- `cursor: grab`/`grabbing` moves from `.movie-card[draggable='true']` to `.drag-handle` only, so the rest of the card shows a normal cursor and doesn't visually suggest it's a drag target anymore.

This needs a real manual verification pass in-browser (per the prior attempt's undocumented failure) before this change is archived — see tasks.md's verification step.

## Reorder gating (1 column only)

`App.tsx`'s existing `dragEnabled = filter === 'all'` becomes `dragEnabled = filter === 'all' && columns === 1`. Everything downstream (the `draggable` prop passed to `MovieCard`, the handle's visibility) already keys off `dragEnabled`, so no other call site changes. This matches Jace's explicit call to lock reordering out of any multi-column layout rather than build 2D grid-aware drop-target logic, which the existing linear `reorderMovies(orderedIds: string[])` (rank = array index) isn't shaped for anyway.
