import { render, screen, fireEvent } from '@testing-library/react';
import InviteCard from '../InviteCard';

describe('InviteCard', () => {
  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();
  const mockOnClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders group and inviter information', () => {
    render(
      <InviteCard
        groupName="Test Group"
        inviterName="John Doe"
        submitting={false}
        error={null}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        onClearError={mockOnClearError}
      />
    );

    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText(/John Doe invited you to join/i)).toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', () => {
    render(
      <InviteCard
        groupName="Test Group"
        inviterName="John Doe"
        submitting={false}
        error={null}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        onClearError={mockOnClearError}
      />
    );

    const acceptButton = screen.getByRole('button', { name: /accept invitation/i });
    fireEvent.click(acceptButton);

    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onDecline when decline button is clicked', () => {
    render(
      <InviteCard
        groupName="Test Group"
        inviterName="John Doe"
        submitting={false}
        error={null}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        onClearError={mockOnClearError}
      />
    );

    const declineButton = screen.getByRole('button', { name: /decline/i });
    fireEvent.click(declineButton);

    expect(mockOnDecline).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when submitting', () => {
    render(
      <InviteCard
        groupName="Test Group"
        inviterName="John Doe"
        submitting={true}
        error={null}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        onClearError={mockOnClearError}
      />
    );

    const acceptButton = screen.getByRole('button', { name: /joining/i });
    const declineButton = screen.getByRole('button', { name: /decline/i });

    expect(acceptButton).toBeDisabled();
    expect(declineButton).toBeDisabled();
  });

  it('displays error message when error is provided', () => {
    render(
      <InviteCard
        groupName="Test Group"
        inviterName="John Doe"
        submitting={false}
        error="Something went wrong"
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        onClearError={mockOnClearError}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onClearError when error alert is closed', () => {
    render(
      <InviteCard
        groupName="Test Group"
        inviterName="John Doe"
        submitting={false}
        error="Something went wrong"
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
        onClearError={mockOnClearError}
      />
    );

    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);

    expect(mockOnClearError).toHaveBeenCalledTimes(1);
  });
});
