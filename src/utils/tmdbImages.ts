import type { Movie } from '../types/movie';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const POSTER_SIZE = 'w500';
const BACKDROP_SIZE = 'original';

export const FALLBACK_POSTER_URL = '/poster-placeholder.svg';
export const FALLBACK_BACKDROP_URL = '/backdrop-placeholder.svg';

export function getPosterUrl(posterPath: Movie['poster_path']): string {
  return posterPath
    ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${posterPath}`
    : FALLBACK_POSTER_URL;
}

export function getBackdropUrl(
  backdropPath: Movie['backdrop_path'],
  posterPath: Movie['poster_path'],
): string {
  if (backdropPath) {
    return `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZE}${backdropPath}`;
  }

  // Fall back to the poster when TMDB has no backdrop, then to the local placeholder.
  return posterPath
    ? `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZE}${posterPath}`
    : FALLBACK_BACKDROP_URL;
}
