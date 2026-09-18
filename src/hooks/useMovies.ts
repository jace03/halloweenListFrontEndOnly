import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { seedMovies } from '../data/seedMovies'
import type { Movie, MovieDraft, MovieRow } from '../types'

function rowToMovie(row: MovieRow): Movie {
  return {
    id: row.id,
    title: row.title,
    year: row.year ?? '',
    addedBy: row.added_by,
    rating: row.rating,
    genre: row.genre ?? '',
    decade: row.decade ?? '',
    rank: row.rank,
    watched: row.watched,
    notes: row.notes,
    cast: (row.movie_actor ?? [])
      .map((link) => link.actors?.name)
      .filter((name): name is string => !!name)
      .sort(),
  }
}

function draftToRow(draft: MovieDraft) {
  return {
    title: draft.title,
    year: draft.year === '' ? null : draft.year,
    added_by: draft.addedBy,
    rating: draft.rating,
    genre: draft.genre.trim() === '' ? null : draft.genre.trim(),
    decade: draft.decade.trim() === '' ? null : draft.decade.trim(),
    rank: draft.rank,
    watched: draft.watched,
    notes: draft.notes,
  }
}

const MOVIE_SELECT = '*, movie_actor(actors(name))'

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('movies')
      .select(MOVIE_SELECT)
      .order('rank', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setError(null)
      setMovies((data as MovieRow[]).map(rowToMovie))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addMovie(draft: MovieDraft) {
    const { data, error: insertError } = await supabase
      .from('movies')
      .insert(draftToRow(draft))
      .select(MOVIE_SELECT)
      .single()

    if (insertError) {
      setError(insertError.message)
      return
    }
    setError(null)
    setMovies((prev) => [...prev, rowToMovie(data as MovieRow)])
  }

  async function updateMovie(id: string, draft: MovieDraft) {
    const { data, error: updateError } = await supabase
      .from('movies')
      .update(draftToRow(draft))
      .eq('id', id)
      .select(MOVIE_SELECT)
      .single()

    if (updateError) {
      setError(updateError.message)
      return
    }
    setError(null)
    setMovies((prev) => prev.map((m) => (m.id === id ? rowToMovie(data as MovieRow) : m)))
  }

  async function deleteMovie(id: string) {
    const { error: deleteError } = await supabase.from('movies').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setError(null)
    setMovies((prev) => prev.filter((m) => m.id !== id))
  }

  async function toggleWatched(id: string) {
    const movie = movies.find((m) => m.id === id)
    if (!movie) return

    const { data, error: updateError } = await supabase
      .from('movies')
      .update({ watched: !movie.watched })
      .eq('id', id)
      .select(MOVIE_SELECT)
      .single()

    if (updateError) {
      setError(updateError.message)
      return
    }
    setError(null)
    setMovies((prev) => prev.map((m) => (m.id === id ? rowToMovie(data as MovieRow) : m)))
  }

  async function resetToSeed() {
    const { error: deleteError } = await supabase
      .from('movies')
      .delete()
      .not('id', 'is', null)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    const { error: insertError } = await supabase
      .from('movies')
      .insert(seedMovies.map(({ id: _id, ...draft }) => draftToRow(draft)))

    if (insertError) {
      setError(insertError.message)
      return
    }

    setError(null)
    await refresh()
  }

  return { movies, loading, error, addMovie, updateMovie, deleteMovie, toggleWatched, resetToSeed }
}
