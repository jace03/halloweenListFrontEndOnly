import { useEffect, useState } from 'react'
import type { Movie, MovieDraft } from '../types'

const emptyDraft: MovieDraft = {
  title: '',
  year: '',
  addedBy: 'Both',
  rating: 5,
  watched: false,
  notes: '',
}

interface MovieFormProps {
  editingMovie: Movie | null
  onSave: (draft: MovieDraft, id: string | null) => void
  onCancel: () => void
}

export function MovieForm({ editingMovie, onSave, onCancel }: MovieFormProps) {
  const [draft, setDraft] = useState<MovieDraft>(emptyDraft)

  useEffect(() => {
    setDraft(editingMovie ? { ...editingMovie } : emptyDraft)
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
            <option value="Me">Me</option>
            <option value="Wife">Wife</option>
          </select>
        </div>

        <div>
          <label htmlFor="rating">Rating</label>
          <select
            id="rating"
            value={draft.rating}
            onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {'🎃'.repeat(n)}
              </option>
            ))}
          </select>
        </div>
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
