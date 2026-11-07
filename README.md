# 03-react-movies

Homework #3 — **React Movies** (movie search via the TMDB API) for the GoIT course
«ІПЗ_5 семестр_React та клієнтська SPA-архітектура», module «Заняття 6. Побічні ефекти».

Assignment page: <https://www.edu.goit.global/learn/43602176/49129355/53932409/homework>
(deadline 10 November 2026, 23:45 Europe/Kyiv). The full captured brief lives outside this
repository: `react-hw3/assignment/react-hw3.md` in the study-desk workspace.

## Task

Build a movie search app:

- `SearchBar` — header with a form; submits the query through **Form Actions**; empty submit shows
  a `Please enter your search query.` toast.
- `MovieGrid` — poster grid; clicking a card opens the movie modal.
- `Loader` — shown instead of the grid while the request is in flight.
- `ErrorMessage` — shown instead of the grid when the HTTP request fails.
- `MovieModal` — rendered through `createPortal`; backdrop image, title, overview, release date and
  rating; closes on the close button, `ESC` and backdrop click; locks body scroll and cleans up
  listeners/state on close.
- `App` — owns the `movies`, `loading`, `error` and `selectedMovie` state, clears previous results on
  every new search and shows a `No movies found for your request.` toast for an empty result array.

The TMDB API read token is provided through the `VITE_TMDB_TOKEN` environment variable — it is never
hardcoded in the source.

## Required structure

```text
src/
  components/
    App/            App.tsx, App.module.css
    SearchBar/      SearchBar.tsx, SearchBar.module.css
    MovieGrid/      MovieGrid.tsx, MovieGrid.module.css
    Loader/         Loader.tsx, Loader.module.css
    ErrorMessage/   ErrorMessage.tsx, ErrorMessage.module.css
    MovieModal/     MovieModal.tsx, MovieModal.module.css
  services/
    movieService.ts fetchMovies(query) — axios call to TMDB /search/movie
  types/
    movie.ts        Movie interface
  index.css
  main.tsx
  vite-env.d.ts
```

Every component is a separate folder with a `.tsx` file and a `.module.css` file of the same name,
exported with `export default`. Styles are copied from
[goitacademy/react-movies-styles](https://github.com/goitacademy/react-movies-styles).

## Stack

Vite, React 19, TypeScript, axios, react-hot-toast, modern-normalize, CSS Modules, Prettier.

## Setup

```sh
npm install
cp .env.example .env.local   # then paste the real TMDB "API Read Access Token"
npm run dev
```

Get the token at <https://www.themoviedb.org/settings/api> (API Read Access Token, v4 auth).
`.env.local` is git-ignored.

## Scripts

```sh
npm run dev          # local dev server
npm run build        # type-check + production build
npm run typecheck    # tsc only
npm run preview      # preview the production build
npm run format       # format with Prettier
npm run format:check # verify formatting
```

## Implementation notes

1. `src/types/movie.ts` — the shared `Movie` interface from the assignment.
2. `src/services/movieService.ts` — `fetchMovies(query): Promise<Movie[]>`; axios GET to
   `https://api.themoviedb.org/3/search/movie` with `Authorization: Bearer ${VITE_TMDB_TOKEN}`;
   response typed as `AxiosResponse<MovieSearchResponse>`.
3. `SearchBar` — React 19 form `action` receives `FormData`, validates the `query` field and calls
   `onSubmit(query)`; the toast library is rendered by `<Toaster />` in `App`.
4. `MovieGrid` — `<ul className={css.grid}>` with `<li><div className={css.card}>…`; `onSelect`
   receives the clicked movie; poster images use the `w500` TMDB size.
5. `MovieModal` — `createPortal(..., document.body)`; two effects keep the `Escape` listener and the
   body scroll lock in sync with the modal lifetime, both cleaned up on unmount; backdrop click is
   filtered with `event.target === event.currentTarget`.
6. `App` — `handleSearch` clears `movies`, resets `error`, toggles `loading`, fetches the movies and
   shows the empty-result toast; render order is `Loader` → `ErrorMessage` → `MovieGrid`, with
   `MovieModal` shown only when `selectedMovie` is set.

## Verification (2026-11-07)

Verified locally on the dev server and on the production build (`vite preview`) with the TMDB API
mocked through Playwright — 38 checks passed, 0 failed:

- initial render, form markup and attributes;
- empty submit → `Please enter your search query.` toast and no request;
- search → grid with posters/titles/`loading="lazy"`, previous results cleared, form reset;
- request carries `Authorization: Bearer <VITE_TMDB_TOKEN>` header;
- modal opens with the backdrop image, title, overview, release date and rating; body scroll
  locked while open; closes on `ESC`, on the close button and on a backdrop click; scroll restored;
- empty response → `No movies found for your request.` toast and an empty grid;
- HTTP error → `ErrorMessage` instead of the grid;
- `Loader` shown while the request is in flight;
- no app console errors/warnings and no page errors (the only browser console error is the
  deliberately mocked HTTP 500 in the error-path check).

Evidence screenshots and the raw report: `react-hw3/evidence/` in the study-desk workspace.

## Checks before submitting

```sh
npm run typecheck     # no type errors
npm run build         # production build succeeds
npm run format:check  # Prettier clean
```

- Browser console: no errors or warnings.
- Deployed on Vercel; submit the repository link + the live page link.
- Wait at least 5 minutes after the final `git push` before submitting.

## Status

- Implementation complete and locally verified (2026-11-07, React 19 + Vite 8).
- Pending: a real TMDB token in `.env.local`, a public GitHub repository, and a Vercel deployment
  (the two links the LMS submission requires).
