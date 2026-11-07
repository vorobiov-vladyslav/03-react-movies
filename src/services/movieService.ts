import axios, { type AxiosResponse } from 'axios';
import type { Movie } from '../types/movie';

interface MovieSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';

export async function fetchMovies(
  query: string,
  signal?: AbortSignal,
): Promise<Movie[]> {
  const token = import.meta.env.VITE_TMDB_TOKEN;

  const response: AxiosResponse<MovieSearchResponse> =
    await axios.get<MovieSearchResponse>(TMDB_SEARCH_URL, {
      params: {
        query,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
      signal,
    });

  return response.data.results;
}
