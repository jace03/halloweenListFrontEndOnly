const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const SEARCH_URL = 'https://api.themoviedb.org/3/search/movie'
const PERSON_SEARCH_URL = 'https://api.themoviedb.org/3/search/person'
const PERSON_URL = 'https://api.themoviedb.org/3/person'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

interface TmdbSearchResult {
  poster_path: string | null
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[]
}

// TMDB genre id -> name, mapped onto the form's suggestion list where one fits.
const GENRE_NAMES: Record<number, string> = {
  27: 'Horror',
  35: 'Comedy',
  14: 'Fantasy',
  53: 'Thriller',
  9648: 'Mystery',
  16: 'Animation',
  10749: 'Romance',
  12: 'Adventure',
  28: 'Action',
  18: 'Drama',
  878: 'Sci-Fi',
  10751: 'Family',
  80: 'Crime',
  36: 'History',
  10402: 'Music',
  37: 'Western',
  10752: 'War',
  99: 'Documentary',
}

export interface MovieSuggestion {
  id: number
  title: string
  year: number | ''
  genre: string
  decade: string
  posterUrl: string | null
}

interface TmdbSuggestionResult {
  id: number
  title: string
  release_date?: string
  genre_ids?: number[]
  poster_path: string | null
}

function pickGenre(ids: number[] = []): string {
  const isRomCom = ids.includes(35) && ids.includes(10749)
  if (isRomCom) return 'Rom-Com'
  // Otherwise use the first genre TMDB lists that we have a name for.
  for (const id of ids) if (GENRE_NAMES[id]) return GENRE_NAMES[id]
  return ''
}

function toSuggestion(r: TmdbSuggestionResult): MovieSuggestion {
  const year = r.release_date ? Number(r.release_date.slice(0, 4)) : NaN
  return {
    id: r.id,
    title: r.title,
    year: Number.isFinite(year) ? year : '',
    genre: pickGenre(r.genre_ids),
    decade: Number.isFinite(year) ? `${Math.floor(year / 10) * 10}s` : '',
    posterUrl: r.poster_path ? `${IMAGE_BASE}${r.poster_path}` : null,
  }
}

export async function searchMovieSuggestions(query: string, signal?: AbortSignal): Promise<MovieSuggestion[]> {
  if (!API_KEY || query.trim().length < 2) return []

  try {
    const params = new URLSearchParams({ api_key: API_KEY, query: query.trim() })
    const response = await fetch(`${SEARCH_URL}?${params.toString()}`, { signal })
    if (!response.ok) return []

    const data = (await response.json()) as { results?: TmdbSuggestionResult[] }
    return (data.results ?? []).slice(0, 6).map(toSuggestion)
  } catch {
    return []
  }
}

export interface ActorSuggestion {
  id: number
  name: string
  photoUrl: string | null
  knownFor: string
}

interface TmdbPersonResult {
  id: number
  name: string
  profile_path: string | null
  known_for?: { title?: string; name?: string }[]
}

export async function searchActors(query: string, signal?: AbortSignal): Promise<ActorSuggestion[]> {
  if (!API_KEY || query.trim().length < 2) return []

  try {
    const params = new URLSearchParams({ api_key: API_KEY, query: query.trim() })
    const response = await fetch(`${PERSON_SEARCH_URL}?${params.toString()}`, { signal })
    if (!response.ok) return []

    const data = (await response.json()) as { results?: TmdbPersonResult[] }
    return (data.results ?? []).slice(0, 6).map((p) => ({
      id: p.id,
      name: p.name,
      photoUrl: p.profile_path ? `${IMAGE_BASE}${p.profile_path}` : null,
      knownFor: (p.known_for ?? [])
        .map((k) => k.title ?? k.name)
        .filter((t): t is string => !!t)
        .slice(0, 3)
        .join(', '),
    }))
  } catch {
    return []
  }
}

export async function fetchActorMovies(personId: number, signal?: AbortSignal): Promise<MovieSuggestion[]> {
  if (!API_KEY) return []

  try {
    const params = new URLSearchParams({ api_key: API_KEY })
    const response = await fetch(`${PERSON_URL}/${personId}/movie_credits?${params.toString()}`, { signal })
    if (!response.ok) return []

    const data = (await response.json()) as { cast?: (TmdbSuggestionResult & { popularity?: number })[] }
    return (data.cast ?? [])
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 30)
      .map(toSuggestion)
  } catch {
    return []
  }
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
