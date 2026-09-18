# Proposal

## Why

The watchlist currently lives only in one browser's `localStorage`. Jace and his wife can't share a single list across their own devices, and anything typed on one browser never shows up on another. Moving the data into Supabase gives the app a real, shared backend while keeping everything else (UI, CRUD flows) the same.

## What Changes

- Add a Supabase Postgres table (`movies`) that mirrors the existing `Movie` shape (title, year, added_by, rating, watched, notes) plus a server-generated `id` and `created_at`.
- No login: the table is open to read/write with the Supabase anon (publishable) key — this is a deliberate simplicity/security tradeoff for a two-person, for-fun app (see design.md).
- Add `@supabase/supabase-js`, a Supabase client module, and a data-access hook that replaces `useLocalStorage` as the source of truth for movies.
- `App.tsx` and children keep their existing props/behavior; only *where the data comes from* changes (Supabase instead of localStorage), plus loading/error states for network calls.
- "Reset to starter list" becomes "wipe the table and re-insert the seed movies" instead of overwriting a localStorage key.
- Document the schema, RLS policy, and setup steps both in-repo (README) and in Confluence (technical doc + how-to doc, as children of the CoastNCode page).

## Capabilities

### New Capabilities
- `movies-backend`: the Supabase schema, RLS policy, and client wiring that makes the movie list a shared, persisted resource.

### Modified Capabilities
- `movie-crud`: existing add/edit/delete/toggle-watched/reset flows now read and write through Supabase instead of localStorage.

## Impact

- Affects: `src/App.tsx`, `src/hooks/useLocalStorage.ts` (removed), new `src/hooks/useMovies.ts`, new `src/lib/supabaseClient.ts`, `src/types.ts` (minor: `id` becomes DB-generated `uuid`), `package.json` (new dependency), `.env.local` / `.env.example` (new).
- Dependencies: `@supabase/supabase-js`.
- No auth, no user accounts — matches the current "just us two" scope. Accepted risk: anyone with the published anon key (visible in client bundle) can read/write the list. Acceptable for a for-fun shared list with no sensitive data; documented explicitly so it's a conscious choice, not an oversight.
- Docs: technical doc + how-to doc published to Confluence under the CoastNCode page; README updated in-repo.
