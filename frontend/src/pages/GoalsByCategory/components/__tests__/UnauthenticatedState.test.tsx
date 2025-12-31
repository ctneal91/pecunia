import { render, screen } from '@testing-library/react';
import UnauthenticatedState from '../UnauthenticatedState';

describe('UnauthenticatedState', () => {
  it('renders login prompt message', () => {
    render(<UnauthenticatedState />);

    expect(screen.getByText(/Please log in to view your goals by category/i)).toBeInTheDocument();
  });
});
