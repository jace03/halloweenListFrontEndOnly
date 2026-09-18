export interface Movie {
  id: string
  title: string
  year: number | ''
  addedBy: 'Me' | 'Wife' | 'Both'
  rating: number
  genre: string
  decade: string
  rank: number | null
  watched: boolean
  notes: string
  cast?: string[]
}

export type MovieDraft = Omit<Movie, 'id' | 'cast'>

export interface MovieRow {
  id: string
  title: string
  year: number | null
  added_by: Movie['addedBy']
  rating: number
  genre: string | null
  decade: string | null
  rank: number | null
  watched: boolean
  notes: string
  created_at: string
  movie_actor?: { actors: { name: string } | null }[]
}
