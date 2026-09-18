# Design

## Data layer

- `MOVIE_SELECT = '*, movie_actor(actors(name))'` used everywhere the hook reads/writes a movie (initial fetch, add, update, toggle-watched) so `cast` stays in sync after every mutation instead of only on the initial load.
- `rowToMovie` flattens the nested join (`movie_actor[].actors.name`) into `cast: string[]`, alphabetically sorted, dropping any null links defensively.
- List ordering: `.order('rank', { ascending: false, nullsFirst: false }).order('created_at', { ascending: true })` — ranked favorites first (highest rank at the top, per Jace's original description of the field), unranked movies after in add-order.
- `genre`/`decade` follow the same `'' <-> null` convention already used for `year`, so the rest of the UI never has to special-case `null`.

## Form fields

- Rating: `<input type="range" min={0} max={10}>` replacing the old 1-5 `<select>` of repeated pumpkins — finer scale doesn't render well as repeated emoji, so it's a numeric slider with a `n/10` label instead.
- Genre/decade: plain text `<input>` with `<datalist>` suggestions (not a hard `<select>`) so freeform values remain possible, matching how the source data wasn't a fixed enum either.
- Rank: plain number input, nullable (empty string clears it). No special UI for reordering/drag-and-drop — out of scope, see Non-goals.

## Non-goals

- **Cast is read-only in this change.** Editing which actors are linked to a movie (adding/removing `movie_actor` rows, autocomplete/search over `actors`) is a materially bigger feature — needs its own multi-select UI and duplicate-actor handling — and is deferred to a future change.
- No drag-and-drop or dedicated "reorder favorites" UI for `rank` — it's a plain number field for now.
- No genre/decade faceted filtering in the list view (only the existing All/Unwatched/Watched filter) — a natural follow-up once there's more data to filter, not required to just surface the fields.