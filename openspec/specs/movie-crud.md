# Capability: movie-crud

Add/edit/delete/toggle-watched/reset flows for the Halloween watchlist, backed by `movies-backend`.

## Behavior

- **Add**: form at the top of the app inserts a new row via `useMovies().addMovie`; appears in the list immediately.
- **Edit**: "Edit" on a movie card loads it into the form; "Save changes" updates the row via `useMovies().updateMovie`.
- **Toggle watched**: checkbox on the movie card flips `watched` via `useMovies().toggleWatched` without opening the edit form.
- **Delete**: "Delete" on a movie card removes the row via `useMovies().deleteMovie`, immediate and permanent.
- **Filter**: All / Unwatched / Watched, client-side filter over the fetched list.
- **Reset to starter list**: confirmation prompt, then `useMovies().resetToSeed` deletes all rows and bulk-inserts `src/data/seedMovies.ts` with fresh server-generated IDs.

## Established via

`changes/archive/halloween-supabase-crud/`, verified end-to-end in-browser by Jace on 2026-09-18.
