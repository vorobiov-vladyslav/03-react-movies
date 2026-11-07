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
- `MovieGrid` — poster grid; a card opens the movie modal with a mouse click, `Enter` or `Space`.
- `Loader` — shown instead of the grid while the request is in flight.
- `ErrorMessage` — shown instead of the grid when the HTTP request fails.
- `MovieModal` — rendered through `createPortal`; backdrop image, title, overview, release date and
  rating; closes on the close button, `ESC` and backdrop click; moves focus inside, traps `Tab` and
  returns focus to the card that opened it; locks body scroll and cleans up listeners/state on close.
- `App` — owns the `movies`, `loading`, `error` and `selectedMovie` state, clears previous results on
  every new search and shows a `No movies found for your request.` toast for an empty result array.
  Only the latest search may update the UI (stale responses and stale errors are ignored).

The TMDB API read token is provided through the `VITE_TMDB_TOKEN` environment variable — it is never
hardcoded in the source. TMDB can return `null` for `poster_path`/`backdrop_path`; in that case the
app renders local placeholder images instead of broken `w500null` / `originalnull` URLs.

## Required structure

```text
src/
  components/
    App/            App.tsx, App.module.css, App.test.tsx
    SearchBar/      SearchBar.tsx, SearchBar.module.css, SearchBar.test.tsx
    MovieGrid/      MovieGrid.tsx, MovieGrid.module.css, MovieGrid.test.tsx
    Loader/         Loader.tsx, Loader.module.css, Loader.test.tsx
    ErrorMessage/   ErrorMessage.tsx, ErrorMessage.module.css, ErrorMessage.test.tsx
    MovieModal/     MovieModal.tsx, MovieModal.module.css, MovieModal.test.tsx
  services/
    movieService.ts fetchMovies(query, signal?) — axios call to TMDB /search/movie
  types/
    movie.ts        Movie interface
  utils/
    tmdbImages.ts   TMDB image URL builders + null fallbacks
  test/
    setup.ts        Vitest + jest-dom setup
    fixtures.ts     shared Movie fixtures
  index.css
  main.tsx
  vite-env.d.ts
```

Every component is a separate folder with a `.tsx` file and a `.module.css` file of the same name,
exported with `export default`. Styles are copied from
[goitacademy/react-movies-styles](https://github.com/goitacademy/react-movies-styles); the only
addition is a `.card:focus-visible` outline so keyboard focus is visible on the cards.

## Stack

Vite, React 19, TypeScript, axios, react-hot-toast, modern-normalize, CSS Modules, Prettier,
Vitest + React Testing Library (jsdom) for unit/component tests, Playwright for end-to-end checks.

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
npm run test         # Vitest unit/component tests (single run)
npm run test:watch   # Vitest in watch mode
npm run preview      # preview the production build
npm run format       # format with Prettier
npm run format:check # verify formatting
```

## Implementation notes

1. `src/types/movie.ts` — the shared `Movie` interface from the assignment; `poster_path` and
   `backdrop_path` are typed `string | null` because the TMDB API returns `null` for movies
   without artwork.
2. `src/services/movieService.ts` — `fetchMovies(query, signal?): Promise<Movie[]>`; axios GET to
   `https://api.themoviedb.org/3/search/movie` with `Authorization: Bearer ${VITE_TMDB_TOKEN}` and
   an optional `AbortSignal`; response typed as `AxiosResponse<MovieSearchResponse>`.
3. `src/utils/tmdbImages.ts` — `getPosterUrl` (w500) and `getBackdropUrl` (original, falls back to
   the poster) build TMDB image URLs; when no path exists they return the local
   `/poster-placeholder.svg` or `/backdrop-placeholder.svg` assets.
4. `SearchBar` — React 19 form `action` receives `FormData`, validates the `query` field and calls
   `onSubmit(query)`; the toast library is rendered by `<Toaster />` in `App`.
5. `MovieGrid` — `<ul className={css.grid}>` with `<li><div className={css.card}>…`; each card has
   `role="button"`, `tabIndex={0}`, `aria-labelledby` pointing at the movie title, and opens on
   `Enter`/`Space` as well as on click.
6. `MovieModal` — `createPortal(..., document.body)` with `aria-modal="true"` and
   `aria-labelledby` naming the title. On mount it moves focus to the close button and remembers the
   opener; `Tab`/`Shift+Tab` cycle inside the dialog; `Escape`, the close button and a backdrop click
   close it; cleanup restores body scroll, removes the keydown listener and returns focus to the
   opener.
7. `App` — every search increments a request id and aborts the previous `AbortController`. Results,
   errors and the `loading` reset only apply when the response belongs to the latest request, so an
   out-of-order response or a late error from an older search cannot overwrite the current UI or
   show a stale toast. Render order is `Loader` → `ErrorMessage` → `MovieGrid`, with `MovieModal`
   shown only when `selectedMovie` is set.

## Tests

`npm run test` runs 46 Vitest + React Testing Library tests (8 files):

- `tmdbImages` — TMDB URL building, null poster/backdrop fallbacks, no `*null` URLs.
- `movieService` — endpoint, query param, bearer token from the env, abort signal, response
  mapping, error propagation.
- `SearchBar` — required markup, trimmed query through the form action, empty/whitespace toast.
- `MovieGrid` — cards, poster URL/`loading="lazy"`, click/`Enter`/`Space` selection, placeholder
  for a `null` poster.
- `MovieModal` — portal, accessible name, content, backdrop/poster/placeholder fallbacks, close via
  button/`ESC`/backdrop, listener cleanup, scroll lock/restore, focus move/trap/return.
- `App` — initial/loading/success/empty/error states, previous-results clearing, stale responses
  in reverse order, stale empty response cannot toast, stale error after a newer success is
  ignored, previous request aborted, modal open from a focused card + focus return on `Escape`.

## Verification (2026-11-07, review fixes)

Verified locally on the dev server and on the production build (`vite preview`) with the TMDB API
mocked through Playwright — **55 browser checks passed, 0 failed**, in addition to the 46 unit tests:

- initial render, form markup and attributes;
- empty submit → `Please enter your search query.` toast and no request;
- search → grid with posters/titles/`loading="lazy"`, previous results cleared, form reset;
- request carries `Authorization: Bearer <VITE_TMDB_TOKEN>` header;
- modal accessible name, content, body scroll lock/restore, close on `ESC`/close button/backdrop,
  focus moved inside, `Tab` trapped, focus returned to the opener card;
- cards open the modal from the keyboard (`Enter`);
- `null` poster → `/poster-placeholder.svg`; `null` backdrop → `/backdrop-placeholder.svg`;
- empty response → `No movies found for your request.` toast and an empty grid;
- HTTP error → `ErrorMessage` instead of the grid;
- `Loader` shown while the request is in flight;
- search race: a slow stale response arriving after a newer search does not replace the newer grid
  (the stale request is aborted, `net::ERR_ABORTED`);
- no app console errors/warnings and no page errors (the only entries are the deliberately mocked
  HTTP 500 and the deliberately aborted race request).

Evidence screenshots and raw reports: `react-hw3/evidence/` (dev server) and
`react-hw3/evidence-prod/` (production build) in the study-desk workspace.

## Checks before submitting

```sh
npm run typecheck     # no type errors
npm run test          # unit/component tests pass
npm run build         # production build succeeds
npm run format:check  # Prettier clean
```

- Browser console: no errors or warnings.
- Deployed on Vercel; submit the repository link + the live page link.
- Wait at least 5 minutes after the final `git push` before submitting.

## Status

- Implementation complete, review issues fixed and locally verified (2026-11-07,
  React 19 + Vite 8, 46 unit tests + 55 Playwright checks on dev and prod builds).
- Pending: a real TMDB token in `.env.local`, a public GitHub repository, and a Vercel deployment
  (the two links the LMS submission requires).
