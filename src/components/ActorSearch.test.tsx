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

  it('shows 30 movies at a time and reveals more with Show more', async () => {
    searchActors.mockResolvedValue([{ id: 7, name: 'Bette Midler', photoUrl: null, knownFor: '' }])
    fetchActorMovies.mockResolvedValue(
      Array.from({ length: 65 }, (_, i) => ({ ...movie, id: i, title: `Movie ${i}` })),
    )
    render(<ActorSearch onPick={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Actor'), 'bet')
    await userEvent.click(await screen.findByRole('button', { name: /Bette Midler/ }))

    const list = await screen.findByRole('list', { name: 'Actor movies' })
    expect(list.querySelectorAll('li')).toHaveLength(30)

    await userEvent.click(screen.getByRole('button', { name: /Show more (35 remaining)/ }))
    expect(list.querySelectorAll('li')).toHaveLength(60)

    await userEvent.click(screen.getByRole('button', { name: /Show more (5 remaining)/ }))
    expect(list.querySelectorAll('li')).toHaveLength(65)
    expect(screen.queryByRole('button', { name: /Show more/ })).not.toBeInTheDocument()
  })
})
