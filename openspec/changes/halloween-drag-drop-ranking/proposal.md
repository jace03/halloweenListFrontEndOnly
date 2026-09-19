# Proposal

## Why

The movie list is sorted by favorite `rank`, but the only way to change a movie's rank today is opening the edit form and typing a new number. There's no direct way to say "move this one above that one" — you have to know the exact numeric rank of every card around it. Drag-and-drop reordering makes ranking the list a direct, visual action: drag a card up or down and its position (and therefore its rank) updates.

`rank` now means "place in the countdown" — 1 is the top favorite, at the top of the list, counting up from there — matching how people actually read a ranked list (a "top 10" starts at #1, not at #10). This flips the original ascending-badge-but-descending-sort behavior from `halloween-ui-expansion`, where a big list's top card showed the largest number (e.g. "#40 fave" for a 40-movie list), which read backwards.

## What Changes

- Cards in the movie list become draggable by grabbing anywhere on the card (desktop mouse drag only for this pass — no touch/mobile drag). Buttons, the checkbox, and other controls inside the card keep working normally since clicking them doesn't initiate a drag.
- Dragging a card to a new position reorders the full list and recomputes `rank` for every movie to match the new visual order: the top card gets `rank = 1`, counting up going down the list. The list is now sorted by `rank` ascending (1 first, unranked last), a flip from the previous "highest first" sort.
- Any card can be dragged, including currently-unranked ones — dropping an unranked card into the list assigns it a rank based on where it lands.
- Drag-and-drop is only enabled while the "All" filter is active. When "Unwatched" or "Watched" is selected, cards are not draggable (reordering a partial list would be ambiguous relative to the hidden movies), matching the existing full-list sort behavior described in `movie-crud`.
- The rank badge moves to the front of the card's title row (top-left of the card) so it's the first thing visible, instead of being grouped with the added-by badge on the right.
- Theme: the orange/purple accent colors are replaced with a dark-blue-based palette (Jace dislikes both) — see design.md for the new tokens.
- Deleting a ranked movie, or editing a ranked movie back to unranked, now closes the resulting gap: every movie ranked below the removed one shifts up by one so the sequence stays dense (`1..N`) with no unreachable numbers. Previously the deleted movie's rank simply vanished — deleting the #1 favorite left #2 as the new top card but still labeled "#2", with no card ever showing "#1" again.

## Capabilities

### Modified Capabilities
- `movie-crud`: the "Sort" behavior gains a way to reorder via drag-and-drop in addition to editing rank manually; ranks become fully sequential across all movies after any drag reorder (no more gaps/nulls once a list has been reordered at least once); the sort direction flips so `rank = 1` is the top favorite at the top of the list. Delete and "edit rank back to unranked" both close the resulting gap so the dense `1..N` sequence is preserved after removal, not just after a drag.

## Non-goals (see design.md for detail)

- No touch/mobile drag support in this pass (desktop mouse only) — the recent mobile-polish pass covered layout/touch-targets but not drag gestures; that's a possible follow-up.
- No reordering while a "Watched"/"Unwatched" filter is active.
- No new fields, filters, or unrelated UI changes.
- No change to how rank is displayed (still a numeric rank badge) or to the add/edit form's manual rank field, which remains available as an alternative way to set rank.

## Impact

- Affects: `src/App.tsx` (list rendering + drag state/handlers), `src/components/MovieCard.tsx` (`draggable` attribute, rank badge placement), `src/hooks/useMovies.ts` (reorder function, flipped sort direction, gap-closing on delete/un-rank), `src/App.css` (drag styling, accent color tokens), `src/index.css` (color palette).
- Data layer: no schema change — reuses the existing `rank` column on `movies`, just writes it more often (per-row update on every reorder or gap-close) and reads it in the opposite order.
- No new dependencies — implemented with the native HTML5 drag-and-drop API.

## Known limitations (accepted, not fixed here)

- Manually typing a rank number in the add/edit form can still create a duplicate rank or a gap (e.g. typing `1` when another movie already has rank 1, or typing `50` in a 5-movie list) — the form does no uniqueness/range checking. This was already true before this change; it isn't made worse, and any inconsistency it creates gets fixed the next time *any* card is dragged (which recomputes every rank from scratch). Fixing manual-entry conflicts properly would mean re-implementing insert/shift logic for the form, which isn't worth it for a number field two people use casually.
- No realtime collaboration: Jace and his wife both have open read/write access with no login. Two people reordering or deleting concurrently from different tabs/devices can race and produce a temporarily inconsistent rank sequence (each client's optimistic update is based on its own last-known list). This predates drag-and-drop and isn't addressed here; a later drag or page refresh resolves it.
