import { useMemo, useState } from 'react'
import './App.css'
import { MovieCard } from './components/MovieCard'
import { MovieForm } from './components/MovieForm'
import { useMovies } from './hooks/useMovies'
import type { Movie, MovieDraft } from './types'

type Filter = 'all' | 'watched' | 'unwatched'
type Columns = 1 | 2 | 3 | 4

const COLUMNS_STORAGE_KEY = 'movie-list-columns'

function loadStoredColumns(): Columns {
  const stored = Number(localStorage.getItem(COLUMNS_STORAGE_KEY))
  return stored === 2 || stored === 3 || stored === 4 ? stored : 1
}

function App() {
  const {
    movies,
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    toggleWatched,
    reorderMovies,
  } = useMovies()
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [columns, setColumns] = useState<Columns>(loadStoredColumns)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const dragEnabled = filter === 'all' && columns === 1

  function handleColumnsChange(next: Columns) {
    setColumns(next)
    localStorage.setItem(COLUMNS_STORAGE_KEY, String(next))
  }

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
    if (draggedId === id || overId === id) {
      setDraggedId(null)
      setOverId(null)
    }
  }

  function handleDragStart(id: string) {
    setDraggedId(id)
  }

  function handleDragEnter(id: string) {
    if (id !== draggedId) setOverId(id)
  }

  function handleDragEnd() {
    setDraggedId(null)
    setOverId(null)
  }

  function handleDrop(targetId: string) {
    if (draggedId && draggedId !== targetId) {
      const ids = movies.map((m) => m.id)
      const fromIndex = ids.indexOf(draggedId)
      const toIndex = ids.indexOf(targetId)
      if (fromIndex !== -1 && toIndex !== -1) {
        const reorderedIds = [...ids]
        reorderedIds.splice(fromIndex, 1)
        reorderedIds.splice(toIndex, 0, draggedId)
        reorderMovies(reorderedIds)
      }
    }
    handleDragEnd()
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
            <div className="columns" role="group" aria-label="Columns">
              {([1, 2, 3, 4] as Columns[]).map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`filter-btn column-btn ${columns === count ? 'active' : ''}`}
                  aria-pressed={columns === count}
                  onClick={() => handleColumnsChange(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : visibleMovies.length === 0 ? (
            <p className="empty-state">No movies here yet — add one above!</p>
          ) : (
            <ul className="movie-list" data-columns={columns}>
              {visibleMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onEdit={setEditingMovie}
                  onDelete={handleDelete}
                  onToggleWatched={toggleWatched}
                  draggable={dragEnabled}
                  isDragging={draggedId === movie.id}
                  isDropTarget={dragEnabled && overId === movie.id && draggedId !== movie.id}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
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
