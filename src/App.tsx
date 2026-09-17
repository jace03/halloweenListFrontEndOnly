import { useMemo, useState } from 'react'
import './App.css'
import { MovieCard } from './components/MovieCard'
import { MovieForm } from './components/MovieForm'
import { seedMovies } from './data/seedMovies'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Movie, MovieDraft } from './types'

type Filter = 'all' | 'watched' | 'unwatched'

function App() {
  const [movies, setMovies] = useLocalStorage<Movie[]>('halloween-movies', seedMovies)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const visibleMovies = useMemo(() => {
    if (filter === 'watched') return movies.filter((m) => m.watched)
    if (filter === 'unwatched') return movies.filter((m) => !m.watched)
    return movies
  }, [movies, filter])

  function handleSave(draft: MovieDraft, id: string | null) {
    if (id) {
      setMovies((prev) => prev.map((m) => (m.id === id ? { ...draft, id } : m)))
      setEditingMovie(null)
    } else {
      setMovies((prev) => [...prev, { ...draft, id: crypto.randomUUID() }])
    }
  }

  function handleDelete(id: string) {
    setMovies((prev) => prev.filter((m) => m.id !== id))
    if (editingMovie?.id === id) setEditingMovie(null)
  }

  function handleToggleWatched(id: string) {
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, watched: !m.watched } : m)),
    )
  }

  function handleResetToDefaults() {
    if (window.confirm('Replace your current list with the starter list? This cannot be undone.')) {
      setMovies(seedMovies)
      setEditingMovie(null)
    }
  }

  const watchedCount = movies.filter((m) => m.watched).length

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎃 Our Halloween Watchlist 👻</h1>
        <p className="subtitle">
          {movies.length} movie{movies.length !== 1 ? 's' : ''} · {watchedCount} watched
        </p>
      </header>

      <main className="app-main">
        <MovieForm
          editingMovie={editingMovie}
          onSave={handleSave}
          onCancel={() => setEditingMovie(null)}
        />

        <section className="list-section">
          <div className="list-toolbar">
            <div className="filters">
              {(['all', 'unwatched', 'watched'] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button type="button" className="btn-link" onClick={handleResetToDefaults}>
              Reset to starter list
            </button>
          </div>

          {visibleMovies.length === 0 ? (
            <p className="empty-state">No movies here yet — add one above!</p>
          ) : (
            <ul className="movie-list">
              {visibleMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onEdit={setEditingMovie}
                  onDelete={handleDelete}
                  onToggleWatched={handleToggleWatched}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
