import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { MovieRow } from '../types'

const { supabase } = vi.hoisted(() => ({ supabase: { from: vi.fn() } }))

vi.mock('../lib/supabaseClient', () => ({ supabase }))

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
  movie_actor: [{ actors: { name: 'Sarah Jessica Parker' } }, { actors: { name: 'Bette Midler' } }],
}

beforeEach(() => {
  supabase.from.mockReset()
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

  it('resetToSeed clears the table, inserts the seed data, and refreshes', async () => {
    supabase.from.mockReturnValueOnce(makeQuery({ data: [row], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const deleteQuery = makeQuery({ error: null })
    const insertQuery = makeQuery({ error: null })
    const refreshQuery = makeQuery({ data: [], error: null })
    supabase.from
      .mockReturnValueOnce(deleteQuery)
      .mockReturnValueOnce(insertQuery)
      .mockReturnValueOnce(refreshQuery)

    await act(async () => {
      await result.current.resetToSeed()
    })

    expect(deleteQuery.not).toHaveBeenCalledWith('id', 'is', null)
    expect(insertQuery.insert).toHaveBeenCalled()
    expect(result.current.movies).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('resetToSeed surfaces a delete error and skips the insert and refresh', async () => {
    supabase.from.mockReturnValueOnce(makeQuery({ data: [], error: null }))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    supabase.from.mockClear()
    supabase.from.mockReturnValueOnce(makeQuery({ error: { message: 'delete failed' } }))
    await act(async () => {
      await result.current.resetToSeed()
    })

    expect(supabase.from).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBe('delete failed')
  })
})
