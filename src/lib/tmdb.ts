const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const SEARCH_URL = 'https://api.themoviedb.org/3/search/movie'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

interface TmdbSearchResult {
  poster_path: string | null
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[]
}

export async function fetchPosterUrl(title: string, year: number | ''): Promise<string | null> {
  if (!API_KEY || !title.trim()) return null

  try {
    const withYear = await searchPoster(title, year || undefined)
    if (withYear) return withYear

    if (year) return await searchPoster(title, undefined)
    return null
  } catch {
    return null
  }
}

async function searchPoster(title: string, year: number | undefined): Promise<string | null> {
  const params = new URLSearchParams({ api_key: API_KEY, query: title })
  if (year) params.set('year', String(year))

  const response = await fetch(`${SEARCH_URL}?${params.toString()}`)
  if (!response.ok) return null

  const data = (await response.json()) as TmdbSearchResponse
  const posterPath = data.results?.[0]?.poster_path
  return posterPath ? `${IMAGE_BASE}${posterPath}` : null
}
