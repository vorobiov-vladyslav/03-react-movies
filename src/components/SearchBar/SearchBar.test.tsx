import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar from './SearchBar';

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));

vi.mock('react-hot-toast', () => ({
  toast: { error: toastError },
}));

const submitForm = (): void => {
  const form = screen.getByRole('button', { name: 'Search' }).closest('form');

  if (!form) {
    throw new Error('search form was not rendered');
  }

  fireEvent.submit(form);
};

describe('SearchBar', () => {
  beforeEach(() => {
    toastError.mockClear();
  });

  it('renders the header markup required by the assignment', () => {
    render(<SearchBar onSubmit={vi.fn()} />);

    const link = screen.getByRole('link', { name: 'Powered by TMDB' });
    expect(link).toHaveAttribute('href', 'https://www.themoviedb.org/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    const input = screen.getByPlaceholderText('Search movies...');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('name', 'query');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveFocus();

    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('submits the trimmed query through the form action', () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Search movies...'), {
      target: { value: '  batman  ' },
    });
    submitForm();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('batman');
    expect(toastError).not.toHaveBeenCalled();
  });

  it('shows a toast and does not submit an empty query', () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);

    submitForm();

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith('Please enter your search query.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only query', () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Search movies...'), {
      target: { value: '   ' },
    });
    submitForm();

    expect(toastError).toHaveBeenCalledWith('Please enter your search query.');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
