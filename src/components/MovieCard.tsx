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
        <span className={`badge badge-${movie.addedBy.toLowerCase()}`}>{movie.addedBy}</span>
      </div>

      <div className="rating">{'🎃'.repeat(movie.rating)}</div>

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
