import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchPosterUrl } from '../lib/tmdb'
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
    posterUrl: row.poster_url,
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
      .order('rank', { ascending: true, nullsFirst: false })
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

  async function closeRankGap(currentMovies: Movie[], vacatedRank: number) {
    const toShift = currentMovies.filter(
      (m): m is Movie & { rank: number } => m.rank !== null && m.rank > vacatedRank,
    )

    if (toShift.length === 0) {
      setError(null)
      setMovies(currentMovies)
      return
    }

    const shiftedRankById = new Map(toShift.map((m) => [m.id, m.rank - 1]))
    setMovies(
      currentMovies.map((m) =>
        shiftedRankById.has(m.id) ? { ...m, rank: shiftedRankById.get(m.id)! } : m,
      ),
    )

    const results = await Promise.all(
      toShift.map((m) => supabase.from('movies').update({ rank: m.rank - 1 }).eq('id', m.id)),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      const message = (failed.error as { message: string }).message
      await refresh()
      setError(message)
      return
    }
    setError(null)
  }

  async function addMovie(draft: MovieDraft) {
    const posterUrl = draft.posterUrl?.trim() || (await fetchPosterUrl(draft.title, draft.year))
    const { data, error: insertError } = await supabase
      .from('movies')
      .insert({ ...draftToRow(draft), poster_url: posterUrl })
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
    const previous = movies.find((m) => m.id === id)
    const titleChanged = previous?.title !== draft.title || previous?.year !== draft.year
    const manualPoster = draft.posterUrl?.trim()
    const posterCleared = draft.posterUrl === ''
    const posterUrl =
      manualPoster ||
      (titleChanged || posterCleared ? await fetchPosterUrl(draft.title, draft.year) : previous?.posterUrl)
    const { data, error: updateError } = await supabase
      .from('movies')
      .update({ ...draftToRow(draft), poster_url: posterUrl })
      .eq('id', id)
      .select(MOVIE_SELECT)
      .single()

    if (updateError) {
      setError(updateError.message)
      return
    }

    const updated = rowToMovie(data as MovieRow)
    const nextMovies = movies.map((m) => (m.id === id ? updated : m))

    if (previous?.rank != null && updated.rank === null) {
      await closeRankGap(nextMovies, previous.rank)
      return
    }

    setError(null)
    setMovies(nextMovies)
  }

  async function deleteMovie(id: string) {
    const target = movies.find((m) => m.id === id)
    const { error: deleteError } = await supabase.from('movies').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    const remaining = movies.filter((m) => m.id !== id)

    if (target?.rank == null) {
      setError(null)
      setMovies(remaining)
      return
    }

    await closeRankGap(remaining, target.rank)
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

  async function reorderMovies(orderedIds: string[]) {
    const previous = movies
    const rankById = new Map(orderedIds.map((id, index) => [id, index + 1]))
    const reordered = orderedIds
      .map((id) => previous.find((m) => m.id === id))
      .filter((m): m is Movie => !!m)

    setMovies(reordered.map((m) => ({ ...m, rank: rankById.get(m.id) ?? m.rank })))

    const results = await Promise.all(
      orderedIds.map((id) => supabase.from('movies').update({ rank: rankById.get(id) }).eq('id', id)),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      setError((failed.error as { message: string }).message)
      setMovies(previous)
      return
    }
    setError(null)
  }

  return {
    movies,
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    toggleWatched,
    reorderMovies,
  }
}
