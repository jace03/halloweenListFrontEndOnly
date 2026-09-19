import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { searchActors, fetchActorMovies } = vi.hoisted(() => ({
  searchActors: vi.fn(),
  fetchActorMovies: vi.fn(),
}))
vi.mock('../lib/tmdb', () => ({ searchActors, fetchActorMovies }))

import { ActorSearch } from './ActorSearch'

const movie = {
  id: 1,
  title: 'Hocus Pocus',
  year: 1993,
  genre: 'Fantasy',
  decade: '1990s',
  posterUrl: null,
}

describe('ActorSearch', () => {
  it('lists matching actors, then their movies, and reports the picked movie', async () => {
    searchActors.mockResolvedValue([{ id: 7, name: 'Bette Midler', photoUrl: null, knownFor: 'Hocus Pocus' }])
    fetchActorMovies.mockResolvedValue([movie])
    const onPick = vi.fn()
    render(<ActorSearch onPick={onPick} />)

    await userEvent.type(screen.getByLabelText('Actor'), 'bet')
    await userEvent.click(await screen.findByRole('button', { name: /Bette Midler/ }))
    expect(fetchActorMovies).toHaveBeenCalledWith(7)

    await userEvent.click(await screen.findByRole('button', { name: /Hocus Pocus/ }))
    expect(onPick).toHaveBeenCalledWith(movie)
  })
})
