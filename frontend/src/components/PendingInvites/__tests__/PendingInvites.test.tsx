import { render, screen, fireEvent } from '@testing-library/react';
import PendingInvites from '../PendingInvites';
import { GroupInvite } from '../../../types/group';

const mockInvites: GroupInvite[] = [
  {
    id: 1,
    email: 'user1@example.com',
    status: 'pending',
    invited_at: '2024-01-01',
    accepted_at: null,
    expired: false,
  },
  {
    id: 2,
    email: 'user2@example.com',
    status: 'pending',
    invited_at: '2024-01-02',
    accepted_at: null,
    expired: true,
  },
  {
    id: 3,
    email: 'user3@example.com',
    status: 'accepted',
    invited_at: '2024-01-03',
    accepted_at: '2024-01-04',
    expired: false,
  },
];

describe('PendingInvites', () => {
  const mockOnResend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pending invites', () => {
    render(<PendingInvites invites={mockInvites} onResend={mockOnResend} />);

    expect(screen.getByText('Pending Invites')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
  });

  it('does not render accepted invites', () => {
    render(<PendingInvites invites={mockInvites} onResend={mockOnResend} />);

    expect(screen.queryByText('user3@example.com')).not.toBeInTheDocument();
  });

  it('shows "Expired" for expired invites', () => {
    render(<PendingInvites invites={mockInvites} onResend={mockOnResend} />);

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('shows sent date for non-expired invites', () => {
    render(<PendingInvites invites={mockInvites} onResend={mockOnResend} />);

    expect(screen.getByText(/Sent/)).toBeInTheDocument();
  });

  it('renders resend button for each invite', () => {
    render(<PendingInvites invites={mockInvites} onResend={mockOnResend} />);

    const resendButtons = screen.getAllByRole('button', { name: /resend/i });
    expect(resendButtons.length).toBe(2);
  });

  it('calls onResend when resend button is clicked', () => {
    render(<PendingInvites invites={mockInvites} onResend={mockOnResend} />);

    const resendButtons = screen.getAllByRole('button', { name: /resend/i });
    fireEvent.click(resendButtons[0]);

    expect(mockOnResend).toHaveBeenCalledWith(mockInvites[0]);
  });

  it('does not render component when there are no pending invites', () => {
    const acceptedInvites = mockInvites.filter(i => i.status === 'accepted');
    const { container } = render(
      <PendingInvites invites={acceptedInvites} onResend={mockOnResend} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render component when invites array is empty', () => {
    const { container } = render(<PendingInvites invites={[]} onResend={mockOnResend} />);

    expect(container.firstChild).toBeNull();
  });
});
