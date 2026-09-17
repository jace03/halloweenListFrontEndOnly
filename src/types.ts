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
