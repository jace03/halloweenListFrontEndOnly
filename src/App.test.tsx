import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import type { Movie } from './types'

const movies: Movie[] = [
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
    notes: '',
    cast: [],
  },
  {
    id: '2',
    title: 'Halloween',
    year: 1978,
    addedBy: 'Me',
    rating: 4,
    genre: 'Horror',
    decade: '1970s',
    rank: null,
    watched: false,
    notes: '',
    cast: [],
  },
]

const addMovie = vi.fn()
const updateMovie = vi.fn()
const deleteMovie = vi.fn()
const toggleWatched = vi.fn()
const resetToSeed = vi.fn()
const useMoviesMock = vi.fn()

vi.mock('./hooks/useMovies', () => ({
  useMovies: () => useMoviesMock(),
}))

function setHookState(overrides: Record<string, unknown> = {}) {
  useMoviesMock.mockReturnValue({
    movies,
    loading: false,
    error: null,
    addMovie,
    updateMovie,
    deleteMovie,
    toggleWatched,
    resetToSeed,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  setHookState()
})

describe('App', () => {
  it('shows a loading state', () => {
    setHookState({ loading: true })
    render(<App />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows the empty state when there are no movies', () => {
    setHookState({ movies: [] })
    render(<App />)
    expect(screen.getByText('No movies here yet — add one above!')).toBeInTheDocument()
  })

  it('shows the total and watched counts in the header', () => {
    render(<App />)
    expect(screen.getByText('2 movies · 1 watched')).toBeInTheDocument()
  })

  it('renders all movies by default', () => {
    render(<App />)
    expect(screen.getByText('Hocus Pocus')).toBeInTheDocument()
    expect(screen.getByText('Halloween')).toBeInTheDocument()
  })

  it('filters to unwatched movies', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Unwatched' }))
    expect(screen.queryByText('Hocus Pocus')).not.toBeInTheDocument()
    expect(screen.getByText('Halloween')).toBeInTheDocument()
  })

  it('filters to watched movies', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Watched' }))
    expect(screen.getByText('Hocus Pocus')).toBeInTheDocument()
    expect(screen.queryByText('Halloween')).not.toBeInTheDocument()
  })

  it('shows the supabase error message when present', () => {
    setHookState({ error: 'timeout' })
    render(<App />)
    expect(screen.getByText('Something went wrong talking to Supabase: timeout')).toBeInTheDocument()
  })

  it('calls addMovie when submitting the form in Add mode', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText('Title'), 'Trick R Treat')
    await userEvent.click(screen.getByRole('button', { name: 'Add movie' }))
    expect(addMovie).toHaveBeenCalledWith(expect.objectContaining({ title: 'Trick R Treat' }))
  })

  it('switches to Edit mode, calls updateMovie on save, and returns to Add mode', async () => {
    render(<App />)
    const editButtons = screen.getAllByText('Edit')
    await userEvent.click(editButtons[0])
    expect(screen.getByRole('heading', { name: 'Edit movie' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(updateMovie).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'Hocus Pocus' }))
    expect(screen.getByRole('heading', { name: 'Add a movie' })).toBeInTheDocument()
  })

  it('clears an in-progress edit when that same movie is deleted', async () => {
    render(<App />)
    const editButtons = screen.getAllByText('Edit')
    await userEvent.click(editButtons[0])
    expect(screen.getByRole('heading', { name: 'Edit movie' })).toBeInTheDocument()

    const deleteButtons = screen.getAllByText('Delete')
    await userEvent.click(deleteButtons[0])
    expect(deleteMovie).toHaveBeenCalledWith('1')
    expect(screen.getByRole('heading', { name: 'Add a movie' })).toBeInTheDocument()
  })

  it('resets to the starter list after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    await userEvent.click(screen.getByText('Reset to starter list'))
    expect(resetToSeed).toHaveBeenCalled()
  })

  it('does not reset when the confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<App />)
    await userEvent.click(screen.getByText('Reset to starter list'))
    expect(resetToSeed).not.toHaveBeenCalled()
  })
})
