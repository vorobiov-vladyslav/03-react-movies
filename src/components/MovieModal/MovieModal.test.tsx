import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BATMAN_BEGINS, MOVIE_WITHOUT_IMAGES } from '../../test/fixtures';
import type { Movie } from '../../types/movie';
import MovieModal from './MovieModal';

const renderModal = (movie: Movie = BATMAN_BEGINS) => {
  const onClose = vi.fn();
  const result = render(<MovieModal movie={movie} onClose={onClose} />);

  return { ...result, onClose };
};

const getCloseButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Close modal' });

describe('MovieModal', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders into a portal outside the React container', () => {
    const { container } = renderModal();

    expect(container).toBeEmptyDOMElement();
    expect(document.body).toContainElement(screen.getByRole('dialog'));
  });

  it('has an accessible name and displays the movie details', () => {
    renderModal();

    const dialog = screen.getByRole('dialog', { name: BATMAN_BEGINS.title });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(
      screen.getByRole('heading', { name: BATMAN_BEGINS.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(BATMAN_BEGINS.overview)).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Release Date: 2005-06-15');
    expect(dialog).toHaveTextContent('Rating: 7.7/10');
    expect(
      screen.getByRole('img', { name: BATMAN_BEGINS.title }),
    ).toHaveAttribute(
      'src',
      `https://image.tmdb.org/t/p/original${BATMAN_BEGINS.backdrop_path}`,
    );
  });

  it('falls back to the poster when backdrop_path is null', () => {
    renderModal({ ...BATMAN_BEGINS, backdrop_path: null });

    expect(
      screen.getByRole('img', { name: BATMAN_BEGINS.title }),
    ).toHaveAttribute(
      'src',
      `https://image.tmdb.org/t/p/original${BATMAN_BEGINS.poster_path}`,
    );
  });

  it('uses the local placeholder when both images are null', () => {
    renderModal(MOVIE_WITHOUT_IMAGES);

    expect(
      screen.getByRole('img', { name: MOVIE_WITHOUT_IMAGES.title }),
    ).toHaveAttribute('src', '/backdrop-placeholder.svg');
  });

  it('closes on the close button', () => {
    const { onClose } = renderModal();

    fireEvent.click(getCloseButton());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on a backdrop click but not on a click inside the modal', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('heading', { name: BATMAN_BEGINS.title }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('removes the keydown listener on unmount', () => {
    const { onClose, unmount } = renderModal();

    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks the body scroll while open and restores the previous value', () => {
    document.body.style.overflow = 'scroll';

    const { unmount } = renderModal();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('moves focus to the close button on mount', () => {
    renderModal();

    expect(getCloseButton()).toHaveFocus();
  });

  it('keeps Tab and Shift+Tab focus inside the dialog', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    expect(getCloseButton()).toHaveFocus();
  });

  it('returns focus to the element that opened the modal', () => {
    const opener = document.createElement('button');
    opener.type = 'button';
    opener.textContent = 'Open movie';
    document.body.append(opener);
    opener.focus();

    const { unmount } = renderModal();
    expect(getCloseButton()).toHaveFocus();

    unmount();

    expect(opener).toHaveFocus();
    opener.remove();
  });
});
