# Proposal

## Why

The app has never had a mobile pass. `App.css` has zero `@media` breakpoints, and `MovieForm`'s `.form-row-inline` hard-codes `flex-direction: row` for groups of two or three fields (year/picked-by/rating, then genre/decade/rank) regardless of viewport width. On a phone-width screen those rows squeeze three inputs — including a range slider with a `n/10` label — into slivers too narrow to use comfortably. The movie card header (title + badge group) and the card actions row (checkbox, Edit, Delete) are similarly untested at narrow widths. This change is a visual/mobile polish pass over the existing UI — no new fields, features, or backend changes.

## What Changes

- `App.css`: add a mobile breakpoint (~480-560px) that stacks `.form-row-inline` groups vertically, and revisit `.movie-card-header`/`.movie-card-actions` wrapping so long titles, multiple badges, and the checkbox/Edit/Delete controls don't overlap or get squeezed on narrow screens.
- Touch targets: bump tap-friendly sizing (min ~40-44px hit area) on `.filter-btn`, `.btn-primary`/`.btn-secondary`, `.btn-link`, and the watched checkbox where they're currently sized for mouse use.
- Typography/spacing scale: reduce `.app-header h1` and related spacing at narrow widths so the header doesn't dominate a phone screen.
- General visual polish pass over existing components (`MovieCard`, `MovieForm`, list toolbar) — spacing, alignment, and small styling refinements — without changing the color palette or overall Halloween theme already established in `index.css`.

## Capabilities

### Modified Capabilities
- `movie-crud`: no behavior changes; add/edit/list/filter/delete/reset flows work the same, just with a responsive, mobile-friendly presentation.

## Non-goals (see design.md for detail)

- No new fields, filters, or features.
- No color palette / theme changes beyond what's needed for readability at small sizes.
- No drag-and-drop, no genre/decade faceted filtering, no cast editing — still out of scope per `halloween-ui-expansion`'s non-goals.

## Impact

- Affects: `src/App.css`, `src/index.css` (breakpoint variables if needed), possibly minor JSX tweaks in `src/App.tsx`, `src/components/MovieCard.tsx`, `src/components/MovieForm.tsx` if markup needs restructuring to support responsive CSS (e.g. wrapping groups).
- No schema or data-layer changes.
- No new dependencies expected — plain CSS media queries.
