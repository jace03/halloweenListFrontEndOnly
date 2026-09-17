# Halloween Watchlist 🎃

A just-for-fun, frontend-only React + TypeScript app for tracking mine and my wife's favourite Halloween movies.

No backend — it's basic CRUD over a hardcoded seed list, persisted to `localStorage` in your browser.

## Features

- Add, edit, and delete movies
- Track title, year, who picked it, a 🎃 rating (1-5), watched status, and notes
- Filter by All / Unwatched / Watched
- "Reset to starter list" to restore the seed data
- Data is saved to `localStorage`, so your changes persist across reloads

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Updating the list

The starter list lives in [`src/data/seedMovies.ts`](src/data/seedMovies.ts). Edit it directly to change what a fresh (or reset) list starts with — it's just an array of `Movie` objects.

## Tech

Vite + React + TypeScript, no backend, no database.
