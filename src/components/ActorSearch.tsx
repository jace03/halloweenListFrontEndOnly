import { useEffect, useState } from 'react'
import {
  fetchActorMovies,
  searchActors,
  type ActorSuggestion,
  type MovieSuggestion,
} from '../lib/tmdb'

const PAGE_SIZE = 30

interface ActorSearchProps {
  onPick: (movie: MovieSuggestion) => void
}

export function ActorSearch({ onPick }: ActorSearchProps) {
  const [query, setQuery] = useState('')
  const [actors, setActors] = useState<ActorSuggestion[]>([])
  const [showActors, setShowActors] = useState(false)
  const [selectedActor, setSelectedActor] = useState<ActorSuggestion | null>(null)
  const [movies, setMovies] = useState<MovieSuggestion[]>([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Only search while the user is actively typing (not after picking an actor).
  useEffect(() => {
    if (!showActors) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const results = await searchActors(query, controller.signal)
      if (!controller.signal.aborted) setActors(results)
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, showActors])

  async function pickActor(actor: ActorSuggestion) {
    setQuery(actor.name)
    setSelectedActor(actor)
    setActors([])
    setShowActors(false)
    setMovies([])
    setVisibleCount(PAGE_SIZE)
    setLoadingMovies(true)
    const results = await fetchActorMovies(actor.id)
    setMovies(results)
    setLoadingMovies(false)
  }

  return (
    <section className="movie-form actor-search">
      <h2>Search by actor</h2>

      <div className="form-row">
        <label htmlFor="actor">Actor</label>
        <div className="title-suggest">
          <input
            id="actor"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowActors(true)
              setSelectedActor(null)
              setMovies([])
            }}
            onBlur={() => setShowActors(false)}
            placeholder="e.g. Bette Midler"
            autoComplete="off"
          />
          {showActors && actors.length > 0 && (
            <ul className="suggestions" role="listbox" aria-label="Actor suggestions">
              {actors.map((a) => (
                <li key={a.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickActor(a)}
                  >
                    {a.photoUrl ? (
                      <img src={a.photoUrl} alt="" width={30} height={45} />
                    ) : (
                      <span className="suggestion-noposter" />
                    )}
                    <span>
                      {a.name}
                      {a.knownFor && <span className="suggestion-year"> — {a.knownFor}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedActor && (
        <div className="actor-movies">
          <h3>Movies with {selectedActor.name}</h3>
          {loadingMovies ? (
            <p className="empty-state">Loading...</p>
          ) : movies.length === 0 ? (
            <p className="empty-state">No movies found.</p>
          ) : (
            <ul className="suggestions suggestions-inline" aria-label="Actor movies">
              {movies.slice(0, visibleCount).map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => onPick(m)}>
                    {m.posterUrl ? (
                      <img src={m.posterUrl} alt="" width={30} height={45} />
                    ) : (
                      <span className="suggestion-noposter" />
                    )}
                    <span>
                      {m.title}
                      {m.year !== '' && <span className="suggestion-year"> ({m.year})</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {movies.length > visibleCount && (
            <button
              type="button"
              className="btn-secondary show-more"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Show more ({movies.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </section>
  )
}
