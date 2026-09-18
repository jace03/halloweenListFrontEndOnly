export interface Movie {
  id: string
  title: string
  year: number | ''
  addedBy: 'Me' | 'Wife' | 'Both'
  rating: number
  watched: boolean
  notes: string
}

export type MovieDraft = Omit<Movie, 'id'>

export interface MovieRow {
  id: string
  title: string
  year: number | null
  added_by: Movie['addedBy']
  rating: number
  watched: boolean
  notes: string
  created_at: string
}
