import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchMovies } from '../../services/movieService';
import { BATMAN_BEGINS, MOVIES, THE_DARK_KNIGHT } from '../../test/fixtures';
import type { Movie } from '../../types/movie';
import App from './App';

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));

vi.mock('react-hot-toast', () => ({
  toast: { error: toastError },
  Toaster: () => null,
}));

vi.mock('../../services/movieService', () => ({
  fetchMovies: vi.fn(),
}));

const fetchMoviesMock = vi.mocked(fetchMovies);

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function submitSearch(query: string): void {
  fireEvent.change(screen.getByPlaceholderText('Search movies...'), {
    target: { value: query },
  });
  fireEvent.submit(
    screen.getByRole('button', { name: 'Search' }).closest('form')!,
  );
}

const flushPromises = (): Promise<void> =>
  act(async () => {
    await Promise.resolve();
  });

describe('App', () => {
  beforeEach(() => {
    fetchMoviesMock.mockReset();
    toastError.mockReset();
  });

  it('renders the search bar and no results state initially', () => {
    render(<App />);

    expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument();
    expect(
      screen.queryByText('Loading movies, please wait...'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('There was an error, please try again...'),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(fetchMoviesMock).not.toHaveBeenCalled();
  });

  it('renders the grid after a successful search', async () => {
    fetchMoviesMock.mockResolvedValue(MOVIES);
    render(<App />);

    submitSearch('batman');

    expect(await screen.findByText(BATMAN_BEGINS.title)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(MOVIES.length);
    expect(fetchMoviesMock).toHaveBeenCalledWith(
      'batman',
      expect.any(AbortSignal),
    );
    expect(
      screen.queryByText('Loading movies, please wait...'),
    ).not.toBeInTheDocument();
  });

  it('shows the loader while a search is in flight', async () => {
    const request = deferred<Movie[]>();
    fetchMoviesMock.mockReturnValue(request.promise);
    render(<App />);

    submitSearch('batman');

    expect(
      screen.getByText('Loading movies, please wait...'),
    ).toBeInTheDocument();

    await act(async () => {
      request.resolve(MOVIES);
    });

    expect(await screen.findByText(BATMAN_BEGINS.title)).toBeInTheDocument();
    expect(
      screen.queryByText('Loading movies, please wait...'),
    ).not.toBeInTheDocument();
  });

  it('shows a toast when TMDB returns no movies', async () => {
    fetchMoviesMock.mockResolvedValue([]);
    render(<App />);

    submitSearch('nothing');

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'No movies found for your request.',
      ),
    );
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('shows the error message when the request fails', async () => {
    fetchMoviesMock.mockRejectedValue(new Error('network down'));
    render(<App />);

    submitSearch('broken');

    expect(
      await screen.findByText('There was an error, please try again...'),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('clears the previous results when a new search starts', async () => {
    const secondRequest = deferred<Movie[]>();
    fetchMoviesMock
      .mockResolvedValueOnce(MOVIES)
      .mockReturnValueOnce(secondRequest.promise);
    render(<App />);

    submitSearch('batman');
    expect(await screen.findByText(BATMAN_BEGINS.title)).toBeInTheDocument();

    submitSearch('dark knight');

    expect(screen.queryByText(BATMAN_BEGINS.title)).not.toBeInTheDocument();
    expect(
      screen.getByText('Loading movies, please wait...'),
    ).toBeInTheDocument();

    await act(async () => {
      secondRequest.resolve([THE_DARK_KNIGHT]);
    });

    expect(await screen.findByText(THE_DARK_KNIGHT.title)).toBeInTheDocument();
  });

  it('ignores a stale response that arrives after a newer search finished', async () => {
    const firstRequest = deferred<Movie[]>();
    const secondRequest = deferred<Movie[]>();
    fetchMoviesMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    render(<App />);

    submitSearch('first');
    submitSearch('second');

    await act(async () => {
      secondRequest.resolve([THE_DARK_KNIGHT]);
    });
    expect(await screen.findByText(THE_DARK_KNIGHT.title)).toBeInTheDocument();

    await act(async () => {
      firstRequest.resolve([BATMAN_BEGINS]);
    });
    await flushPromises();

    expect(screen.queryByText(BATMAN_BEGINS.title)).not.toBeInTheDocument();
    expect(screen.getByText(THE_DARK_KNIGHT.title)).toBeInTheDocument();
    expect(
      screen.queryByText('Loading movies, please wait...'),
    ).not.toBeInTheDocument();
  });

  it('aborts the previous request when a new search starts', () => {
    const firstRequest = deferred<Movie[]>();
    const secondRequest = deferred<Movie[]>();
    fetchMoviesMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    render(<App />);

    submitSearch('first');
    submitSearch('second');

    const firstSignal = fetchMoviesMock.mock.calls[0][1];
    expect(firstSignal).toBeInstanceOf(AbortSignal);
    expect(firstSignal?.aborted).toBe(true);
    expect(fetchMoviesMock.mock.calls[1][1]?.aborted).toBe(false);
  });

  it('ignores an empty stale response so it cannot show a toast', async () => {
    const firstRequest = deferred<Movie[]>();
    const secondRequest = deferred<Movie[]>();
    fetchMoviesMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    render(<App />);

    submitSearch('first');
    submitSearch('second');

    await act(async () => {
      secondRequest.resolve([BATMAN_BEGINS]);
    });
    expect(await screen.findByText(BATMAN_BEGINS.title)).toBeInTheDocument();

    await act(async () => {
      firstRequest.resolve([]);
    });
    await flushPromises();

    expect(toastError).not.toHaveBeenCalled();
  });

  it('ignores a stale request error after a newer search succeeded', async () => {
    const firstRequest = deferred<Movie[]>();
    const secondRequest = deferred<Movie[]>();
    fetchMoviesMock
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    render(<App />);

    submitSearch('first');
    submitSearch('second');

    await act(async () => {
      secondRequest.resolve([BATMAN_BEGINS]);
    });
    expect(await screen.findByText(BATMAN_BEGINS.title)).toBeInTheDocument();

    await act(async () => {
      firstRequest.reject(new Error('stale request failed'));
    });
    await flushPromises();

    expect(
      screen.queryByText('There was an error, please try again...'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(BATMAN_BEGINS.title)).toBeInTheDocument();
    expect(
      screen.queryByText('Loading movies, please wait...'),
    ).not.toBeInTheDocument();
  });

  it('opens the modal from a keyboard-focused card and returns focus on Escape', async () => {
    fetchMoviesMock.mockResolvedValue(MOVIES);
    render(<App />);

    submitSearch('batman');
    const card = await screen.findByRole('button', {
      name: BATMAN_BEGINS.title,
    });
    card.focus();
    fireEvent.click(card);

    expect(
      await screen.findByRole('dialog', { name: BATMAN_BEGINS.title }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(card).toHaveFocus();
  });
});
