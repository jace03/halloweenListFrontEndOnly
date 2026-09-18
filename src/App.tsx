import { useMemo, useState } from 'react'
import './App.css'
import { MovieCard } from './components/MovieCard'
import { MovieForm } from './components/MovieForm'
import { useMovies } from './hooks/useMovies'
import type { Movie, MovieDraft } from './types'

type Filter = 'all' | 'watched' | 'unwatched'

function App() {
  const { movies, loading, error, addMovie, updateMovie, deleteMovie, toggleWatched, resetToSeed } =
    useMovies()
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const visibleMovies = useMemo(() => {
    if (filter === 'watched') return movies.filter((m) => m.watched)
    if (filter === 'unwatched') return movies.filter((m) => !m.watched)
    return movies
  }, [movies, filter])

  function handleSave(draft: MovieDraft, id: string | null) {
    if (id) {
      updateMovie(id, draft)
      setEditingMovie(null)
    } else {
      addMovie(draft)
    }
  }

  function handleDelete(id: string) {
    deleteMovie(id)
    if (editingMovie?.id === id) setEditingMovie(null)
  }

  function handleResetToDefaults() {
    if (window.confirm('Replace your current list with the starter list? This cannot be undone.')) {
      resetToSeed()
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
        {error && <p className="empty-state">Something went wrong talking to Supabase: {error}</p>}

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

          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : visibleMovies.length === 0 ? (
            <p className="empty-state">No movies here yet — add one above!</p>
          ) : (
            <ul className="movie-list">
              {visibleMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onEdit={setEditingMovie}
                  onDelete={handleDelete}
                  onToggleWatched={toggleWatched}
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
