import { render, screen } from '@testing-library/react';
import UnauthenticatedState from '../UnauthenticatedState';

describe('UnauthenticatedState', () => {
  it('renders login message', () => {
    render(<UnauthenticatedState />);

    expect(screen.getByText(/Please log in to view group details/i)).toBeInTheDocument();
  });
});
