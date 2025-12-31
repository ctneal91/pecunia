import { render, screen, fireEvent } from '@testing-library/react';
import LeaveGroupDialog from '../LeaveGroupDialog';

describe('LeaveGroupDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnLeave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <LeaveGroupDialog
        open={true}
        groupName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByText('Leave Group?')).toBeInTheDocument();
  });

  it('displays group name in confirmation message', () => {
    render(
      <LeaveGroupDialog
        open={true}
        groupName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByText(/leave "Test Group"/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <LeaveGroupDialog
        open={true}
        groupName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onLeave={mockOnLeave}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onLeave when leave button is clicked', () => {
    render(
      <LeaveGroupDialog
        open={true}
        groupName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onLeave={mockOnLeave}
      />
    );

    const leaveButton = screen.getByRole('button', { name: /leave/i });
    fireEvent.click(leaveButton);

    expect(mockOnLeave).toHaveBeenCalledTimes(1);
  });

  it('disables leave button when submitting', () => {
    render(
      <LeaveGroupDialog
        open={true}
        groupName="Test Group"
        submitting={true}
        onClose={mockOnClose}
        onLeave={mockOnLeave}
      />
    );

    const leaveButton = screen.getByRole('button', { name: /leave/i });
    expect(leaveButton).toBeDisabled();
  });
});
