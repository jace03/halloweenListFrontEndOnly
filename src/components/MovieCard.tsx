import type { Movie } from '../types'

interface MovieCardProps {
  movie: Movie
  onEdit: (movie: Movie) => void
  onDelete: (id: string) => void
  onToggleWatched: (id: string) => void
}

export function MovieCard({ movie, onEdit, onDelete, onToggleWatched }: MovieCardProps) {
  return (
    <li className={`movie-card ${movie.watched ? 'watched' : ''}`}>
      <div className="movie-card-header">
        <h3>
          {movie.title} {movie.year !== '' && <span className="year">({movie.year})</span>}
        </h3>
        <div className="badge-group">
          {movie.rank !== null && <span className="badge badge-rank">#{movie.rank} fave</span>}
          <span className={`badge badge-${movie.addedBy.toLowerCase()}`}>{movie.addedBy}</span>
        </div>
      </div>

      {(movie.genre || movie.decade) && (
        <div className="tags">
          {movie.genre && <span className="tag">{movie.genre}</span>}
          {movie.decade && <span className="tag">{movie.decade}</span>}
        </div>
      )}

      <div className="rating">{movie.rating > 0 ? `🎃 ${movie.rating}/10` : 'Not rated yet'}</div>

      {!!movie.cast?.length && <p className="cast">Cast: {movie.cast.join(', ')}</p>}

      {movie.notes && <p className="notes">{movie.notes}</p>}

      <div className="movie-card-actions">
        <label className="checkbox-label small">
          <input
            type="checkbox"
            checked={movie.watched}
            onChange={() => onToggleWatched(movie.id)}
          />
          Watched
        </label>
        <div className="spacer" />
        <button type="button" className="btn-link" onClick={() => onEdit(movie)}>
          Edit
        </button>
        <button type="button" className="btn-link danger" onClick={() => onDelete(movie.id)}>
          Delete
        </button>
      </div>
    </li>
  )
}
