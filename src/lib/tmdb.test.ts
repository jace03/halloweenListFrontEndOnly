import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('fetchActorMovies', () => {
  it('orders movies newest first and puts undated movies last', async () => {
    vi.stubEnv('VITE_TMDB_API_KEY', 'test-key')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          cast: [
            { id: 1, title: 'Old', release_date: '1988-04-01', poster_path: null, popularity: 99 },
            { id: 2, title: 'Undated', release_date: '', poster_path: null, popularity: 50 },
            { id: 3, title: 'New', release_date: '2019-10-01', poster_path: null, popularity: 1 },
            { id: 4, title: 'Middle', release_date: '1993-07-16', poster_path: null, popularity: 10 },
            { id: 5, title: 'Also undated', poster_path: null },
          ],
        }),
      }),
    )
    const { fetchActorMovies } = await import('./tmdb')

    const movies = await fetchActorMovies(7)

    expect(movies.map((m) => m.title)).toEqual(['New', 'Middle', 'Old', 'Undated', 'Also undated'])
  })
})
