import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { MovieRow } from '../types'

const { supabase } = vi.hoisted(() => ({ supabase: { from: vi.fn() } }))
const { fetchPosterUrl } = vi.hoisted(() => ({ fetchPosterUrl: vi.fn() }))

vi.mock('../lib/supabaseClient', () => ({ supabase }))
vi.mock('../lib/tmdb', () => ({ fetchPosterUrl }))

const { useMovies } = await import('./useMovies')

type QueryResult = { data?: unknown; error?: unknown }

function makeQuery(result: QueryResult) {
  const q: Record<string, unknown> = { data: result.data ?? null, error: result.error ?? null }
  for (const method of ['select', 'order', 'insert', 'update', 'delete', 'eq', 'not', 'single']) {
    q[method] = vi.fn(() => q)
  }
  return q as typeof q & { [key: string]: ReturnType<typeof vi.fn> }
}

const row: MovieRow = {
  id: '1',
  title: 'Hocus Pocus',
  year: 1993,
  added_by: 'Both',
  rating: 5,
  genre: 'Fantasy',
  decade: '1990s',
  rank: null,
  watched: true,
  notes: 'Annual tradition.',
  created_at: '2024-01-01',
  poster_url: null,
  movie_actor: [{ actors: { name: 'Sarah Jessica Parker' } }, { actors: { name: 'Bette Midler' } }],
}

beforeEach(() => {
  supabase.from.mockReset()
  fetchPosterUrl.mockReset()
  fetchPosterUrl.mockResolvedValue(null)
})

describe('useMovies', () => {
  it('loads movies on mount, maps rows, and sorts cast names', async () => {
    supabase.from.mockReturnValue(makeQuery({ data: [row], error: null }))
    const { result } = renderHook(() => useMovies())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
    expect(result.current.movies).toEqual([
      {
        id: '1',
        title: 'Hocus Pocus',
        year: 1993,
        addedBy: 'Both',
        rating: 5,
        genre: 'Fantasy',
        decade: '1990s',
        rank: null,
        watched: true,
        notes: 'Annual tradition.',
        posterUrl: null,
        cast: ['Bette Midler', 'Sarah Jessica Parker'],
      },
    ])
  })

  it('falls back to empty strings for null year/genre/decade and an empty cast array', async () => {
    const bareRow: MovieRow = { ...row, year: null, genre: null, decade: null, movie_actor: [] }
    supabase.from.mockReturnValue(makeQuery({ data: [bareRow], error: null }))
    const { result } = renderHook(() => useMovies())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.movies[0]).toMatchObject({ year: '', genre: '', decade: '', cast: [] })
  })

  it('sets an error message when the initial fetch fails', async () => {
    supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'network down' } }))
    const { result } = renderHook(() => useMovies())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network down')
    expect(result.current.movies).toEqual([])
  })

  it('addMovie appends the newly inserted movie on success', async () => {
    supabase.from.mockReturnValueOnce(makeQuery({ data: [], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockReturnValueOnce(makeQuery({ data: row, error: null }))
    await act(async () => {
      await result.current.addMovie({
        title: 'Hocus Pocus',
        year: 1993,
        addedBy: 'Both',
        rating: 5,
        genre: 'Fantasy',
        decade: '1990s',
        rank: null,
        watched: true,
        notes: 'Annual tradition.',
      })
    })

    expect(result.current.movies).toHaveLength(1)
    expect(result.current.movies[0].title).toBe('Hocus Pocus')
    expect(result.current.error).toBeNull()
  })

  it('addMovie sets an error and leaves the list unchanged on failure', async () => {
    supabase.from.mockReturnValueOnce(makeQuery({ data: [], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockReturnValueOnce(makeQuery({ data: null, error: { message: 'insert failed' } }))
    await act(async () => {
      await result.current.addMovie({
        title: 'Bad Movie',
        year: '',
        addedBy: 'Me',
        rating: 0,
        genre: '',
        decade: '',
        rank: null,
        watched: false,
        notes: '',
      })
    })

    expect(result.current.movies).toEqual([])
    expect(result.current.error).toBe('insert failed')
  })

  it('updateMovie applies the server response without shifting ranks for a normal edit', async () => {
    supabase.from.mockReturnValueOnce(makeQuery({ data: [row], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockClear()
    supabase.from.mockReturnValueOnce(makeQuery({ data: { ...row, title: 'New Title' }, error: null }))
    await act(async () => {
      await result.current.updateMovie('1', {
        title: 'New Title',
        year: row.year ?? '',
        addedBy: row.added_by,
        rating: row.rating,
        genre: row.genre ?? '',
        decade: row.decade ?? '',
        rank: row.rank,
        watched: row.watched,
        notes: row.notes,
      })
    })

    expect(supabase.from).toHaveBeenCalledTimes(1)
    expect(result.current.movies[0].title).toBe('New Title')
    expect(result.current.error).toBeNull()
  })

  it('updateMovie closes the rank gap when a ranked movie is edited back to unranked', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 2 }
    const rowC: MovieRow = { ...row, id: 'c', rank: 3 }
    supabase.from.mockReturnValueOnce(makeQuery({ data: [rowA, rowB, rowC], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockReturnValueOnce(makeQuery({ data: { ...rowA, rank: null }, error: null }))
    const updateB = makeQuery({ error: null })
    const updateC = makeQuery({ error: null })
    supabase.from.mockReturnValueOnce(updateB).mockReturnValueOnce(updateC)

    await act(async () => {
      await result.current.updateMovie('a', {
        title: rowA.title,
        year: rowA.year ?? '',
        addedBy: rowA.added_by,
        rating: rowA.rating,
        genre: rowA.genre ?? '',
        decade: rowA.decade ?? '',
        rank: null,
        watched: rowA.watched,
        notes: rowA.notes,
      })
    })

    const ranks = Object.fromEntries(result.current.movies.map((m) => [m.id, m.rank]))
    expect(ranks).toEqual({ a: null, b: 1, c: 2 })
    expect(updateB.update).toHaveBeenCalledWith({ rank: 1 })
    expect(updateC.update).toHaveBeenCalledWith({ rank: 2 })
    expect(result.current.error).toBeNull()
  })

  it('deleteMovie removes the movie from state on success', async () => {
    supabase.from.mockReturnValueOnce(makeQuery({ data: [row], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockReturnValueOnce(makeQuery({ error: null }))
    await act(async () => {
      await result.current.deleteMovie('1')
    })

    expect(result.current.movies).toEqual([])
  })

  it('deleteMovie closes the rank gap by shifting down the ranks of movies below the deleted one', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 2 }
    const rowC: MovieRow = { ...row, id: 'c', rank: 3 }
    supabase.from.mockReturnValueOnce(makeQuery({ data: [rowA, rowB, rowC], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const deleteQuery = makeQuery({ error: null })
    const updateB = makeQuery({ error: null })
    const updateC = makeQuery({ error: null })
    supabase.from.mockReturnValueOnce(deleteQuery).mockReturnValueOnce(updateB).mockReturnValueOnce(updateC)

    await act(async () => {
      await result.current.deleteMovie('a')
    })

    const ranks = Object.fromEntries(result.current.movies.map((m) => [m.id, m.rank]))
    expect(ranks).toEqual({ b: 1, c: 2 })
    expect(updateB.update).toHaveBeenCalledWith({ rank: 1 })
    expect(updateC.update).toHaveBeenCalledWith({ rank: 2 })
    expect(result.current.error).toBeNull()
  })

  it('deleteMovie does not shift ranks when the deleted movie was unranked', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: null }
    supabase.from.mockReturnValueOnce(makeQuery({ data: [rowA, rowB], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockReturnValueOnce(makeQuery({ error: null }))
    await act(async () => {
      await result.current.deleteMovie('b')
    })

    expect(result.current.movies).toEqual([expect.objectContaining({ id: 'a', rank: 1 })])
  })

  it('deleteMovie surfaces an error and re-fetches if closing the rank gap fails to persist', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 2 }
    supabase.from.mockReturnValueOnce(makeQuery({ data: [rowA, rowB], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const deleteQuery = makeQuery({ error: null })
    const failedUpdate = makeQuery({ error: { message: 'update failed' } })
    const refreshQuery = makeQuery({ data: [{ ...rowB }], error: null })
    supabase.from.mockReturnValueOnce(deleteQuery).mockReturnValueOnce(failedUpdate).mockReturnValueOnce(refreshQuery)

    await act(async () => {
      await result.current.deleteMovie('a')
    })

    expect(result.current.error).toBe('update failed')
    expect(result.current.movies).toEqual([expect.objectContaining({ id: 'b', rank: 2 })])
  })

  it('toggleWatched flips the watched flag returned by the server', async () => {
    supabase.from.mockReturnValueOnce(makeQuery({ data: [row], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockReturnValueOnce(makeQuery({ data: { ...row, watched: false }, error: null }))
    await act(async () => {
      await result.current.toggleWatched('1')
    })

    expect(result.current.movies[0].watched).toBe(false)
  })

  it('toggleWatched is a no-op for an unknown id', async () => {
    supabase.from.mockReturnValueOnce(makeQuery({ data: [row], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockClear()
    await act(async () => {
      await result.current.toggleWatched('does-not-exist')
    })

    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('reorderMovies recomputes sequential ranks and persists them per-row', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: null }
    const rowB: MovieRow = { ...row, id: 'b', rank: null }
    supabase.from.mockReturnValueOnce(makeQuery({ data: [rowA, rowB], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const updateB = makeQuery({ error: null })
    const updateA = makeQuery({ error: null })
    supabase.from.mockReturnValueOnce(updateB).mockReturnValueOnce(updateA)

    await act(async () => {
      await result.current.reorderMovies(['b', 'a'])
    })

    expect(result.current.movies.map((m) => m.id)).toEqual(['b', 'a'])
    expect(result.current.movies[0].rank).toBe(1)
    expect(result.current.movies[1].rank).toBe(2)
    expect(updateB.update).toHaveBeenCalledWith({ rank: 1 })
    expect(updateA.update).toHaveBeenCalledWith({ rank: 2 })
    expect(result.current.error).toBeNull()
  })

  it('reorderMovies reverts to the previous order and sets an error if a persist call fails', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 2 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 1 }
    supabase.from.mockReturnValueOnce(makeQuery({ data: [rowA, rowB], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from
      .mockReturnValueOnce(makeQuery({ error: null }))
      .mockReturnValueOnce(makeQuery({ error: { message: 'update failed' } }))

    await act(async () => {
      await result.current.reorderMovies(['b', 'a'])
    })

    expect(result.current.movies.map((m) => m.id)).toEqual(['a', 'b'])
    expect(result.current.error).toBe('update failed')
  })
})
