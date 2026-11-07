import type { Movie } from '../types/movie';

const batmanBegins: Movie = {
  id: 101,
  title: 'Batman Begins',
  poster_path: '/batman-begins-poster.jpg',
  backdrop_path: '/batman-begins-backdrop.jpg',
  overview:
    'A young Bruce Wayne travels the world seeking the means to fight injustice.',
  release_date: '2005-06-15',
  vote_average: 7.7,
};

const theDarkKnight: Movie = {
  id: 102,
  title: 'The Dark Knight',
  poster_path: '/the-dark-knight-poster.jpg',
  backdrop_path: '/the-dark-knight-backdrop.jpg',
  overview: 'Batman raises the stakes in his war on crime.',
  release_date: '2008-07-18',
  vote_average: 8.5,
};

const movieWithoutImages: Movie = {
  id: 103,
  title: 'No Art Movie',
  poster_path: null,
  backdrop_path: null,
  overview: 'This movie has neither a poster nor a backdrop.',
  release_date: '2024-01-01',
  vote_average: 5,
};

export const MOVIES: Movie[] = [batmanBegins, theDarkKnight];

export const BATMAN_BEGINS = batmanBegins;
export const THE_DARK_KNIGHT = theDarkKnight;
export const MOVIE_WITHOUT_IMAGES = movieWithoutImages;
