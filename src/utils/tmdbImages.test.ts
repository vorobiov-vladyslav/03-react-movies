import { describe, expect, it } from 'vitest';
import { BATMAN_BEGINS } from '../test/fixtures';
import {
  FALLBACK_BACKDROP_URL,
  FALLBACK_POSTER_URL,
  getBackdropUrl,
  getPosterUrl,
} from './tmdbImages';

describe('tmdbImages', () => {
  it('builds a w500 poster URL from a poster path', () => {
    expect(getPosterUrl('/poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/w500/poster.jpg',
    );
  });

  it('uses the local placeholder when the poster path is null', () => {
    expect(getPosterUrl(null)).toBe(FALLBACK_POSTER_URL);
  });

  it('builds an original backdrop URL from a backdrop path', () => {
    expect(getBackdropUrl('/backdrop.jpg', '/poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/original/backdrop.jpg',
    );
  });

  it('falls back to the poster when the backdrop path is null', () => {
    expect(getBackdropUrl(null, '/poster.jpg')).toBe(
      'https://image.tmdb.org/t/p/original/poster.jpg',
    );
  });

  it('uses the local placeholder when neither image exists', () => {
    expect(getBackdropUrl(null, null)).toBe(FALLBACK_BACKDROP_URL);
  });

  it('never produces URLs like w500null or originalnull', () => {
    expect(getPosterUrl(BATMAN_BEGINS.poster_path)).not.toContain('null');
    expect(
      getBackdropUrl(BATMAN_BEGINS.backdrop_path, BATMAN_BEGINS.poster_path),
    ).not.toContain('null');
  });
});
