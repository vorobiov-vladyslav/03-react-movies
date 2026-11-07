import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MOVIES } from '../test/fixtures';
import { fetchMovies } from './movieService';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock('axios', () => ({
  default: { get: getMock },
}));

interface MovieSearchResponse {
  page: number;
  results: typeof MOVIES;
  total_pages: number;
  total_results: number;
}

const axiosResponse = (
  results: typeof MOVIES,
): AxiosResponse<MovieSearchResponse> =>
  ({
    data: {
      page: 1,
      results,
      total_pages: 1,
      total_results: results.length,
    },
  }) as AxiosResponse<MovieSearchResponse>;

describe('fetchMovies', () => {
  beforeEach(() => {
    getMock.mockReset();
    vi.stubEnv('VITE_TMDB_TOKEN', 'test-token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requests the TMDB search endpoint with the query and bearer token', async () => {
    getMock.mockResolvedValue(axiosResponse(MOVIES));

    const movies = await fetchMovies('batman');

    expect(movies).toEqual(MOVIES);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie',
      expect.objectContaining({
        params: { query: 'batman' },
        headers: {
          Authorization: 'Bearer test-token',
          accept: 'application/json',
        },
      }),
    );
  });

  it('reads the token from the environment at request time', async () => {
    getMock.mockResolvedValue(axiosResponse([]));
    vi.stubEnv('VITE_TMDB_TOKEN', 'another-token');

    await fetchMovies('batman');

    expect(getMock.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer another-token',
    );
  });

  it('passes the abort signal to axios', async () => {
    getMock.mockResolvedValue(axiosResponse([]));
    const abortController = new AbortController();

    await fetchMovies('batman', abortController.signal);

    expect(getMock.mock.calls[0][1].signal).toBe(abortController.signal);
  });

  it('returns an empty array when TMDB has no results', async () => {
    getMock.mockResolvedValue(axiosResponse([]));

    await expect(fetchMovies('nothing')).resolves.toEqual([]);
  });

  it('rejects when the HTTP request fails', async () => {
    getMock.mockRejectedValue(new Error('network down'));

    await expect(fetchMovies('batman')).rejects.toThrow('network down');
  });
});
