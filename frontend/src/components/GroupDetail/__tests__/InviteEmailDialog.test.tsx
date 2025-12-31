import { render, screen, fireEvent } from '@testing-library/react';
import InviteEmailDialog from '../InviteEmailDialog';

describe('InviteEmailDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnEmailChange = jest.fn();
  const mockOnSendInvite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail=""
        sendingInvite={false}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    expect(screen.getByText('Invite by Email')).toBeInTheDocument();
  });

  it('displays group name in description', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail=""
        sendingInvite={false}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    expect(screen.getByText(/join Test Group/i)).toBeInTheDocument();
  });

  it('displays email in input field', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail="test@example.com"
        sendingInvite={false}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    const input = screen.getByLabelText(/email address/i) as HTMLInputElement;
    expect(input.value).toBe('test@example.com');
  });

  it('calls onEmailChange when input changes', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail=""
        sendingInvite={false}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    const input = screen.getByLabelText(/email address/i);
    fireEvent.change(input, { target: { value: 'new@example.com' } });

    expect(mockOnEmailChange).toHaveBeenCalledWith('new@example.com');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail="test@example.com"
        sendingInvite={false}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSendInvite when send button is clicked', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail="test@example.com"
        sendingInvite={false}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    fireEvent.click(sendButton);

    expect(mockOnSendInvite).toHaveBeenCalledTimes(1);
  });

  it('disables send button when sending', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail="test@example.com"
        sendingInvite={true}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    const sendButton = screen.getByRole('button', { name: /sending/i });
    expect(sendButton).toBeDisabled();
  });

  it('disables send button when email is empty', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail="   "
        sendingInvite={false}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    const sendButton = screen.getByRole('button', { name: /send invite/i });
    expect(sendButton).toBeDisabled();
  });

  it('shows "Sending..." text when sending', () => {
    render(
      <InviteEmailDialog
        open={true}
        groupName="Test Group"
        inviteEmail="test@example.com"
        sendingInvite={true}
        onClose={mockOnClose}
        onEmailChange={mockOnEmailChange}
        onSendInvite={mockOnSendInvite}
      />
    );

    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });
});
