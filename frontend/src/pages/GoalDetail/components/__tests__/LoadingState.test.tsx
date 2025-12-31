import { render, screen } from '@testing-library/react';
import LoadingState from '../LoadingState';

describe('LoadingState', () => {
  it('renders loading message', () => {
    render(<LoadingState />);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
