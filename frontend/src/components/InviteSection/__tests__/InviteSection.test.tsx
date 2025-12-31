import { render, screen, fireEvent } from '@testing-library/react';
import InviteSection from '../InviteSection';

describe('InviteSection', () => {
  const mockOnCopyInviteCode = jest.fn();
  const mockOnRegenerateInvite = jest.fn();
  const mockOnOpenInviteDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders invite section with code', () => {
    render(
      <InviteSection
        inviteCode="ABC123"
        copied={false}
        onCopyInviteCode={mockOnCopyInviteCode}
        onRegenerateInvite={mockOnRegenerateInvite}
        onOpenInviteDialog={mockOnOpenInviteDialog}
      />
    );

    expect(screen.getByText('Invite Members')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  it('renders email invite button', () => {
    render(
      <InviteSection
        inviteCode="ABC123"
        copied={false}
        onCopyInviteCode={mockOnCopyInviteCode}
        onRegenerateInvite={mockOnRegenerateInvite}
        onOpenInviteDialog={mockOnOpenInviteDialog}
      />
    );

    const emailButton = screen.getByRole('button', { name: /send email invite/i });
    expect(emailButton).toBeInTheDocument();
  });

  it('calls onOpenInviteDialog when email button is clicked', () => {
    render(
      <InviteSection
        inviteCode="ABC123"
        copied={false}
        onCopyInviteCode={mockOnCopyInviteCode}
        onRegenerateInvite={mockOnRegenerateInvite}
        onOpenInviteDialog={mockOnOpenInviteDialog}
      />
    );

    const emailButton = screen.getByRole('button', { name: /send email invite/i });
    fireEvent.click(emailButton);

    expect(mockOnOpenInviteDialog).toHaveBeenCalledTimes(1);
  });

  it('calls onCopyInviteCode when copy button is clicked', () => {
    render(
      <InviteSection
        inviteCode="ABC123"
        copied={false}
        onCopyInviteCode={mockOnCopyInviteCode}
        onRegenerateInvite={mockOnRegenerateInvite}
        onOpenInviteDialog={mockOnOpenInviteDialog}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(mockOnCopyInviteCode).toHaveBeenCalledTimes(1);
  });

  it('calls onRegenerateInvite when regenerate button is clicked', () => {
    render(
      <InviteSection
        inviteCode="ABC123"
        copied={false}
        onCopyInviteCode={mockOnCopyInviteCode}
        onRegenerateInvite={mockOnRegenerateInvite}
        onOpenInviteDialog={mockOnOpenInviteDialog}
      />
    );

    const regenerateButton = screen.getByRole('button', { name: /generate new code/i });
    fireEvent.click(regenerateButton);

    expect(mockOnRegenerateInvite).toHaveBeenCalledTimes(1);
  });

  it('shows "Copied!" tooltip when copied is true', () => {
    render(
      <InviteSection
        inviteCode="ABC123"
        copied={true}
        onCopyInviteCode={mockOnCopyInviteCode}
        onRegenerateInvite={mockOnRegenerateInvite}
        onOpenInviteDialog={mockOnOpenInviteDialog}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copied!/i });
    expect(copyButton).toBeInTheDocument();
  });

  it('does not render invite code section when inviteCode is empty', () => {
    render(
      <InviteSection
        inviteCode=""
        copied={false}
        onCopyInviteCode={mockOnCopyInviteCode}
        onRegenerateInvite={mockOnRegenerateInvite}
        onOpenInviteDialog={mockOnOpenInviteDialog}
      />
    );

    expect(screen.queryByText(/Invite code:/i)).not.toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(
      <InviteSection
        inviteCode="ABC123"
        copied={false}
        onCopyInviteCode={mockOnCopyInviteCode}
        onRegenerateInvite={mockOnRegenerateInvite}
        onOpenInviteDialog={mockOnOpenInviteDialog}
      />
    );

    expect(screen.getByText(/Share this code or send an email invite/i)).toBeInTheDocument();
  });
});
