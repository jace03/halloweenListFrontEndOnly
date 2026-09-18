# Tasks

## 1. OpenSpec

- [x] 1.1 Scaffold `openspec/` (config.yaml, specs/, changes/) in this repo
- [x] 1.2 Write proposal.md, design.md, tasks.md for `halloween-supabase-crud`

## 2. Supabase schema

- [x] 2.1 Apply migration creating the `movies` table and verify it appears in `list_tables`
- [x] 2.2 Enable RLS and add the public anon policy, and verify the security advisor no longer flags missing RLS on `movies`
- [x] 2.3 Seed the table with the existing `seedMovies` starter list and verify 3 rows exist

## 3. Client wiring

- [x] 3.1 Install `@supabase/supabase-js` and verify it appears in `package.json` dependencies
- [x] 3.2 Add `src/lib/supabaseClient.ts` reading `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- [x] 3.3 Add `.env.local` (real values, gitignored) and `.env.example` (placeholders, committed)

## 4. Data layer

- [x] 4.1 Add `src/hooks/useMovies.ts` (fetch, add, update, delete, toggleWatched, resetToSeed, loading/error state)
- [x] 4.2 Remove `src/hooks/useLocalStorage.ts` and its usage in `App.tsx`
- [x] 4.3 Wire `App.tsx` to `useMovies` and verify the app still builds with no TypeScript errors

## 5. UI verification (manual, in browser)

- [x] 5.1 Start `npm run dev`, confirm the dev server serves the app (`http://localhost:5173`, verified reachable)
- [x] 5.2-5.5 Add/update/toggle/delete flows verified by calling the same REST endpoint + anon key the app's `useMovies` hook uses (insert, patch, delete all confirmed round-tripping correctly); table left back at the 3 seed rows afterward
- [x] 5.6 Click "Reset to starter list" in an actual browser and confirm the UI updates — confirmed by Jace: full CRUD + reset flow all working in the browser

## 6. Documentation

- [x] 6.1 Update repo `README.md` to describe the Supabase backend and env var setup
- [x] 6.2 Publish a technical doc to Confluence (schema, RLS, architecture) as a child of the CoastNCode page
- [x] 6.3 Publish a how-to doc to Confluence (day-to-day usage, adding/editing movies) as a child of the CoastNCode page
- [x] 6.4 Append a dated entry under CoastNCode's Projects/Websites section for this project

## 7. Wrap-up

- [x] 7.1 Run `npm run build` and `npm run lint`, verify both pass
- [x] 7.2 Move this change folder to `openspec/changes/archive/` once everything above is done
