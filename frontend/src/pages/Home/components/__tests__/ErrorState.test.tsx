import { render, screen } from '@testing-library/react';
import ErrorState from '../ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState error="Test error message" />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders error alert with error severity', () => {
    const { container } = render(<ErrorState error="Error" />);

    const alert = container.querySelector('.MuiAlert-standardError');
    expect(alert).toBeInTheDocument();
  });
});
