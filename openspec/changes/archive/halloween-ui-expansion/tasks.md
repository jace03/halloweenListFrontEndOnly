# Tasks

## 1. OpenSpec

- [x] 1.1 Write proposal.md, design.md, tasks.md for `halloween-ui-expansion`

## 2. Types & data layer

- [x] 2.1 Extend `Movie`/`MovieDraft`/`MovieRow` with `genre`, `decade`, `rank`, `cast`
- [x] 2.2 Update `useMovies` fetch to select nested cast (`movie_actor(actors(name))`) and order by `rank` desc/`created_at` asc
- [x] 2.3 Update `rowToMovie`/`draftToRow` for the new fields
- [x] 2.4 Update `addMovie`/`updateMovie`/`toggleWatched` to select cast on every mutation
- [x] 2.5 Update `seedMovies` with genre/decade for the 3 starter movies

## 3. UI

- [x] 3.1 `MovieForm`: 0-10 rating slider, genre/decade inputs with datalist suggestions, rank input
- [x] 3.2 `MovieCard`: genre/decade tags, rank badge, updated rating display, cast line
- [x] 3.3 `App.css`: styles for tags, rank badge, cast text

## 4. Verification

- [x] 4.1 `npm run build` passes
- [x] 4.2 `npm run lint` passes (2 pre-existing warnings unrelated to this change, not introduced by it)
- [x] 4.3 Verified the app's actual Supabase queries (nested cast select + rank ordering, insert/delete round-trip with new field shape) directly against the live project
- [x] 4.4 Archived on Jace's go-ahead. Note: no browser automation tool was available in the implementing session, so the in-browser click-through was not independently verified by the agent — dev server was left running at `http://localhost:5173` for manual spot-checking.

## 5. Documentation

- [x] 5.1 Update `openspec/specs/movie-crud.md`
- [x] 5.2 Update Confluence technical/how-to docs, and the CoastNCode project log, under the CoastNCode page
- [x] 5.3 Move this change folder to `openspec/changes/archive/`