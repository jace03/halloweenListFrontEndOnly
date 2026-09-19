import { useEffect, useState } from 'react'
import type { Movie, MovieDraft } from '../types'

const GENRE_SUGGESTIONS = ['Comedy', 'Horror', 'Fantasy', 'Thriller', 'Mystery', 'Rom-Com', 'Animation']
const DECADE_SUGGESTIONS = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s']

const emptyDraft: MovieDraft = {
  title: '',
  year: '',
  addedBy: 'Both',
  rating: 5,
  genre: '',
  decade: '',
  rank: null,
  watched: false,
  notes: '',
  posterUrl: '',
}

interface MovieFormProps {
  editingMovie: Movie | null
  onSave: (draft: MovieDraft, id: string | null) => void
  onCancel: () => void
}

export function MovieForm({ editingMovie, onSave, onCancel }: MovieFormProps) {
  const [draft, setDraft] = useState<MovieDraft>(emptyDraft)

  useEffect(() => {
    setDraft(editingMovie ? { ...editingMovie, posterUrl: editingMovie.posterUrl ?? '' } : emptyDraft)
  }, [editingMovie])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.title.trim()) return
    onSave(draft, editingMovie?.id ?? null)
    if (!editingMovie) setDraft(emptyDraft)
  }

  return (
    <form className="movie-form" onSubmit={handleSubmit}>
      <h2>{editingMovie ? 'Edit movie' : 'Add a movie'}</h2>

      <div className="form-row">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="e.g. Hocus Pocus"
          required
        />
      </div>

      <div className="form-row form-row-inline">
        <div>
          <label htmlFor="year">Year</label>
          <input
            id="year"
            type="number"
            value={draft.year}
            onChange={(e) =>
              setDraft({
                ...draft,
                year: e.target.value === '' ? '' : Number(e.target.value),
              })
            }
            placeholder="1993"
          />
        </div>

        <div>
          <label htmlFor="addedBy">Picked by</label>
          <select
            id="addedBy"
            value={draft.addedBy}
            onChange={(e) =>
              setDraft({ ...draft, addedBy: e.target.value as Movie['addedBy'] })
            }
          >
            <option value="Both">Both</option>
            <option value="His">His</option>
            <option value="Hers">Hers</option>
          </select>
        </div>

        <div>
          <label htmlFor="rating">Rating ({draft.rating > 0 ? `${draft.rating}/10` : 'unrated'})</label>
          <input
            id="rating"
            type="range"
            min={0}
            max={10}
            value={draft.rating}
            onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="form-row form-row-inline">
        <div>
          <label htmlFor="genre">Genre</label>
          <input
            id="genre"
            type="text"
            list="genre-suggestions"
            value={draft.genre}
            onChange={(e) => setDraft({ ...draft, genre: e.target.value })}
            placeholder="e.g. Horror"
          />
          <datalist id="genre-suggestions">
            {GENRE_SUGGESTIONS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="decade">Decade</label>
          <input
            id="decade"
            type="text"
            list="decade-suggestions"
            value={draft.decade}
            onChange={(e) => setDraft({ ...draft, decade: e.target.value })}
            placeholder="e.g. 1990s"
          />
          <datalist id="decade-suggestions">
            {DECADE_SUGGESTIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="rank">Favorite rank</label>
          <input
            id="rank"
            type="number"
            value={draft.rank ?? ''}
            onChange={(e) =>
              setDraft({ ...draft, rank: e.target.value === '' ? null : Number(e.target.value) })
            }
            placeholder="unranked"
          />
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="posterUrl">Poster image URL</label>
        <input
          id="posterUrl"
          type="url"
          value={draft.posterUrl ?? ''}
          onChange={(e) => setDraft({ ...draft, posterUrl: e.target.value })}
          placeholder="Optional — leave blank to look one up automatically"
        />
      </div>

      <div className="form-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={draft.watched}
            onChange={(e) => setDraft({ ...draft, watched: e.target.checked })}
          />
          Watched
        </label>
      </div>

      <div className="form-row">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="Optional notes..."
          rows={2}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editingMovie ? 'Save changes' : 'Add movie'}
        </button>
        {editingMovie && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
