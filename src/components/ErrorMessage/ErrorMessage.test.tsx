import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message', () => {
    render(<ErrorMessage />);

    expect(
      screen.getByText('There was an error, please try again...'),
    ).toBeInTheDocument();
  });
});
