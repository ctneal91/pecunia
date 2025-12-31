import { render, screen } from '@testing-library/react';
import AcceptedState from '../AcceptedState';

describe('AcceptedState', () => {
  it('renders welcome message with group name', () => {
    render(<AcceptedState groupName="Test Group" />);

    expect(screen.getByText('Welcome to Test Group!')).toBeInTheDocument();
    expect(screen.getByText('Redirecting you to the group...')).toBeInTheDocument();
  });

  it('shows success icon', () => {
    const { container } = render(<AcceptedState groupName="Test Group" />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
