# Proposal

## Why

The list currently renders as a single vertical column (`<ul class="movie-list">`), and any point on a card starts a drag (per `halloween-drag-drop-ranking`, a handle-only design was tried first and abandoned because grabbing the card body did nothing). Two problems Jace wants addressed together:

- A single column wastes horizontal space on wider screens — a 40-movie list is a long scroll with a lot of unused width beside each card.
- Dragging from anywhere on the card means every click near an edge risks starting a drag instead of, say, scrolling or selecting text, and it isn't obvious *how* to reorder without already knowing the whole card is a grab target.

This change adds a user-facing column-count toggle (1/2/3/4 columns) and a dedicated drag-handle (a "⋮⋮" dots icon) on the side of each card as the *only* place a drag can start from.

## What Changes

- A column toggle appears in the list toolbar (alongside the All/Unwatched/Watched filter buttons) with four options: 1, 2, 3, and 4 columns. The chosen count is applied immediately and persisted (e.g. `localStorage`) so it survives a reload.
- `movie-list` becomes a CSS grid with `grid-template-columns` driven by the selected count instead of a single-column `<ul>`. Below a mobile breakpoint, the grid collapses to 1 column regardless of the selected count (there isn't room for multiple columns on a phone).
- A drag-handle (dots icon, `⋮⋮`) is added to the side of each `MovieCard`. Dragging now only starts from that handle — pressing down anywhere else on the card (title, poster, buttons, checkbox) no longer initiates a drag. This differs from the earlier abandoned handle-only attempt: the whole card stays `draggable` so the drag image is the full card, but `onDragStart` checks whether the press originated on the handle and cancels the drag (`event.preventDefault()`) if not — see design.md for why the first attempt didn't work and why this approach avoids the same failure.
- Reordering via drag-and-drop is only enabled when both existing conditions hold (filter is "All") *and* the layout is 1 column. At 2/3/4 columns, cards are not draggable — the drag handle is hidden/disabled — because a single linear rank sequence wrapped into a multi-column grid makes "drop position" visually ambiguous (per Jace's decision to lock reordering out of grid mode rather than build 2D grid-aware reordering).
- No change to what data is shown per card, to rank computation, or to the sort order — this is purely a layout/interaction change.

## Capabilities

### Modified Capabilities
- `movie-crud`: "Display" gains a user-selectable 1/2/3/4-column grid layout (persisted, responsive collapse to 1 column on mobile) in place of the fixed single-column list. "Reorder via drag-and-drop" gains a dedicated drag-handle as the only drag-initiation point, and gains a second gating condition — reordering is only available at 1 column, in addition to the existing "All filter only" condition.

## Non-goals

- No 2D grid-aware reordering (dragging a card to a specific row/column slot in a multi-column grid). The underlying list stays one linear ranked sequence; the grid only changes how many columns it wraps into for display, and reordering is simply unavailable above 1 column.
- No new column-count options beyond 1/2/3/4, and no separate desktop-vs-mobile manual override — mobile always forces 1 column.
- No touch/mobile drag support (unchanged from `halloween-drag-drop-ranking` — still desktop mouse only).
- No change to filters, card content/fields, rank display, or theme.

## Impact

- Affects: `src/App.tsx` (column-count state + persistence, toolbar toggle, drag-enabled condition), `src/components/MovieCard.tsx` (drag-handle element, `onDragStart` target check), `src/App.css` (grid layout rules per column count, responsive breakpoint, handle styling).
- No data layer or schema changes — this is presentation-only.
- No new dependencies — CSS grid + a small handle-origin check on the existing native HTML5 drag API.
