import type { KeyboardEvent } from 'react';
import type { Movie } from '../../types/movie';
import { getPosterUrl } from '../../utils/tmdbImages';
import css from './MovieGrid.module.css';

interface MovieGridProps {
  movies: Movie[];
  onSelect: (movie: Movie) => void;
}

export default function MovieGrid({ movies, onSelect }: MovieGridProps) {
  const handleSelect = (movie: Movie): void => {
    onSelect(movie);
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    movie: Movie,
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(movie);
    }
  };

  return (
    <ul className={css.grid}>
      {movies.map((movie) => {
        const titleId = `movie-card-title-${movie.id}`;

        return (
          <li key={movie.id}>
            <div
              className={css.card}
              role="button"
              tabIndex={0}
              aria-labelledby={titleId}
              onClick={() => handleSelect(movie)}
              onKeyDown={(event) => handleCardKeyDown(event, movie)}
            >
              <img
                className={css.image}
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                loading="lazy"
              />
              <h2 className={css.title} id={titleId}>
                {movie.title}
              </h2>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
