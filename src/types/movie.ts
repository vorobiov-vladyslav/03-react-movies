export interface Movie {
  id: number;
  // TMDB returns `null` when a movie has no poster/backdrop image.
  poster_path: string | null;
  backdrop_path: string | null;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
}
