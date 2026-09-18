# Design

## Breakpoint strategy

- Single mobile breakpoint at `max-width: 560px` (covers phones; the app's `max-width: 760px` container already handles tablet/desktop fine since it just centers with margin).
- `.form-row-inline` switches to `flex-direction: column` below the breakpoint so each field (year, picked-by, rating; genre, decade, rank) gets full width instead of a third of it.
- `.movie-card-header` keeps `flex` but allows wrapping (`flex-wrap: wrap`) below the breakpoint so a long title plus multiple badges (added-by + rank) drops the badge group to its own line instead of squeezing both onto one.
- `.movie-card-actions` (checkbox, spacer, Edit, Delete) gets `flex-wrap: wrap` and slightly reduced `gap` below the breakpoint so it doesn't overflow on narrow cards.

## Touch targets

- `.filter-btn`, `.btn-primary`, `.btn-secondary` get a `min-height: 40px` (not applied via padding alone, since padding-only sizing is inconsistent across the row of pill filter buttons) — done with `min-height` + existing padding so text doesn't look oversized on desktop.
- `.checkbox-label input[type="checkbox"]` gets `width`/`height` bumped slightly (e.g. 18px) via a rule scoped to that selector, not a global `input` override, so it doesn't affect range/number/text inputs.
- `.btn-link` (Reset to starter list, Edit, Delete text-links) gets a touch-friendly `padding` bump below the breakpoint since it currently relies on default line-height for its hit area.

## Typography/spacing

- `.app-header h1` drops from `34px` to something like `26px` below the breakpoint; `.app` padding stays as-is (`24px 16px 64px` already has a small side gutter appropriate for phones).
- No changes to `--orange`/`--purple`/etc. color tokens in `index.css` — this pass is layout/spacing/touch-target only, not a re-theme.

## Non-goals

- No new fields, features, filters, or data-layer changes — this is presentation-only.
- No dark/light theme rework — `prefers-color-scheme` handling in `index.css` is untouched.
- No drag-and-drop reordering, no genre/decade faceted filtering, no cast editing UI — still deferred per `halloween-ui-expansion`.
- No changes to `useMovies`, `types.ts`, or Supabase queries.
