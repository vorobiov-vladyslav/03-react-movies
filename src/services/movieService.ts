import axios, { type AxiosResponse } from 'axios';
import type { Movie } from '../types/movie';

interface MovieSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

export async function fetchMovies(query: string): Promise<Movie[]> {
  const response: AxiosResponse<MovieSearchResponse> =
    await axios.get<MovieSearchResponse>(TMDB_SEARCH_URL, {
      params: {
        query,
      },
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        accept: 'application/json',
      },
    });

  return response.data.results;
}
