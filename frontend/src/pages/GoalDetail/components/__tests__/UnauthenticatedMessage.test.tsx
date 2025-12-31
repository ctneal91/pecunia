import { render, screen } from '@testing-library/react';
import UnauthenticatedMessage from '../UnauthenticatedMessage';

describe('UnauthenticatedMessage', () => {
  it('renders sign up message', () => {
    render(<UnauthenticatedMessage />);

    expect(screen.getByText(/Sign up to track your contribution history/i)).toBeInTheDocument();
  });
});
