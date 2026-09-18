# Tasks

## 1. OpenSpec

- [x] 1.1 Write proposal.md, design.md, tasks.md for `halloween-grid-columns-drag-handle`

## 2. Column layout

- [x] 2.1 `App.tsx`: add `columns` state (`1 | 2 | 3 | 4`), initialized from and persisted to `localStorage` (`movie-list-columns`)
- [x] 2.2 `App.tsx`: add a column-count button group (`1`/`2`/`3`/`4`) to the list toolbar, next to the filter buttons
- [x] 2.3 `App.tsx`: pass `data-columns={columns}` on the `<ul className="movie-list">`
- [x] 2.4 `App.css`: convert `.movie-list` to `display: grid`, base single column, with `[data-columns='2'|'3'|'4']` rules scoped inside the existing `@media (min-width: 561px)` range so mobile always renders 1 column regardless of the stored preference (see design.md)

## 3. Drag handle

- [x] 3.1 `MovieCard.tsx`: add a `.drag-handle` element (dots icon) at the left edge of the card, rendered only when `draggable` is true
- [x] 3.2 `MovieCard.tsx`: track a `handlePressed` ref set on the handle's `onMouseDown`, reset on `onDragEnd`/handle `onMouseUp`; `onDragStart` on the `<li>` calls `event.preventDefault()` and bails when `handlePressed.current` is false, so a drag can only begin from the handle
- [x] 3.3 `App.css`: move `cursor: grab`/`grabbing` from `.movie-card[draggable='true']` to `.drag-handle`; style the handle (icon, size, hover state)

## 4. Reorder gating

- [x] 4.1 `App.tsx`: change `dragEnabled` from `filter === 'all'` to `filter === 'all' && columns === 1`

## 5. Tests

- [x] 5.1 `MovieCard.test.tsx`: dragging is not initiated when `mousedown`/`dragstart` originates outside the handle; is initiated from the handle; handle is absent/inert when `draggable` is false
- [x] 5.2 `App.test.tsx`: column toggle updates `data-columns` and persists to `localStorage`; `dragEnabled`/draggable cards become false when `columns !== 1`, independent of `filter`

## 6. Verification

- [x] 6.1 `npm run build` passes
- [x] 6.2 `npm run lint` passes (same 2 pre-existing warnings as before, unrelated to this change)
- [x] 6.3 `npm test` passes (67/67, including handle-origin drag gating and column-toggle coverage)
- [x] 6.4 Manually verified in-browser by Jace via the running dev server (Claude in Chrome wasn't connected this session, so the agent couldn't do this independently). Caught two real issues along the way, both fixed in this same change: (1) grid items refused to shrink below their content's intrinsic width, so the row overflowed rightward past the centered `.app` container instead of columns actually getting thinner (`min-width: 0` added to `.movie-card`); (2) at 3/4 columns the fixed-size poster squeezed the text into an unusably thin strip that overflowed the card (header/badges/actions now wrap, and 3/4-column cards stack the poster above the body instead of beside it, with a smaller poster at 4 columns). Desktop still looks "thin" at 3/4 columns per Jace's feedback — tracked as follow-up work, not blocking this archive.
- [x] 6.5 Jace confirms it looks/feels right before archiving

## 7. Documentation

- [x] 7.1 Update `openspec/specs/movie-crud.md`'s "Display" and "Reorder via drag-and-drop" behavior for the column toggle and handle-only/1-column-only gating
- [x] 7.2 Update Confluence CoastNCode project log
- [x] 7.3 Move this change folder to `openspec/changes/archive/`
