import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  BATMAN_BEGINS,
  MOVIES,
  MOVIE_WITHOUT_IMAGES,
} from '../../test/fixtures';
import MovieGrid from './MovieGrid';

describe('MovieGrid', () => {
  it('renders one list item per movie with poster, title and lazy loading', () => {
    render(<MovieGrid movies={MOVIES} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(MOVIES.length);

    const poster = screen.getByRole('img', { name: BATMAN_BEGINS.title });
    expect(poster).toHaveAttribute(
      'src',
      `https://image.tmdb.org/t/p/w500${BATMAN_BEGINS.poster_path}`,
    );
    expect(poster).toHaveAttribute('loading', 'lazy');
    expect(
      screen.getByRole('heading', { level: 2, name: BATMAN_BEGINS.title }),
    ).toBeInTheDocument();
  });

  it('renders nothing when the movie list is empty', () => {
    const { container } = render(<MovieGrid movies={[]} onSelect={vi.fn()} />);

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('uses the local placeholder when poster_path is null', () => {
    render(<MovieGrid movies={[MOVIE_WITHOUT_IMAGES]} onSelect={vi.fn()} />);

    expect(
      screen.getByRole('img', { name: MOVIE_WITHOUT_IMAGES.title }),
    ).toHaveAttribute('src', '/poster-placeholder.svg');
  });

  it('calls onSelect with the clicked movie', () => {
    const onSelect = vi.fn();
    render(<MovieGrid movies={MOVIES} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: BATMAN_BEGINS.title }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(BATMAN_BEGINS);
  });

  it('opens a card with the Enter key', () => {
    const onSelect = vi.fn();
    render(<MovieGrid movies={MOVIES} onSelect={onSelect} />);

    const card = screen.getByRole('button', { name: BATMAN_BEGINS.title });
    card.focus();
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(BATMAN_BEGINS);
  });

  it('opens a card with the Space key without scrolling the page', () => {
    const onSelect = vi.fn();
    render(<MovieGrid movies={MOVIES} onSelect={onSelect} />);

    const card = screen.getByRole('button', { name: BATMAN_BEGINS.title });
    card.focus();
    const event = fireEvent.keyDown(card, { key: ' ' });

    expect(event).toBe(false);
    expect(onSelect).toHaveBeenCalledWith(BATMAN_BEGINS);
  });
});
