import { render, screen, fireEvent } from '@testing-library/react';
import MemberActionsMenu from '../MemberActionsMenu';
import { Membership } from '../../../types/group';

const mockMember: Membership = {
  id: 1,
  user_id: 2,
  user_name: 'John Doe',
  user_email: 'john@example.com',
  role: 'member',
  joined_at: '2024-01-01',
};

const mockAdminMember: Membership = {
  ...mockMember,
  role: 'admin',
};

describe('MemberActionsMenu', () => {
  const mockOnClose = jest.fn();
  const mockOnToggleAdmin = jest.fn();
  const mockOnRemoveMember = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders menu when open with member', () => {
    const anchorEl = document.createElement('div');

    render(
      <MemberActionsMenu
        anchorEl={anchorEl}
        member={mockMember}
        onClose={mockOnClose}
        onToggleAdmin={mockOnToggleAdmin}
        onRemoveMember={mockOnRemoveMember}
      />
    );

    expect(screen.getByText('Make Admin')).toBeInTheDocument();
    expect(screen.getByText('Remove from Group')).toBeInTheDocument();
  });

  it('shows "Remove Admin" for admin members', () => {
    const anchorEl = document.createElement('div');

    render(
      <MemberActionsMenu
        anchorEl={anchorEl}
        member={mockAdminMember}
        onClose={mockOnClose}
        onToggleAdmin={mockOnToggleAdmin}
        onRemoveMember={mockOnRemoveMember}
      />
    );

    expect(screen.getByText('Remove Admin')).toBeInTheDocument();
  });

  it('shows "Make Admin" for non-admin members', () => {
    const anchorEl = document.createElement('div');

    render(
      <MemberActionsMenu
        anchorEl={anchorEl}
        member={mockMember}
        onClose={mockOnClose}
        onToggleAdmin={mockOnToggleAdmin}
        onRemoveMember={mockOnRemoveMember}
      />
    );

    expect(screen.getByText('Make Admin')).toBeInTheDocument();
  });

  it('calls onToggleAdmin when admin toggle is clicked', () => {
    const anchorEl = document.createElement('div');

    render(
      <MemberActionsMenu
        anchorEl={anchorEl}
        member={mockMember}
        onClose={mockOnClose}
        onToggleAdmin={mockOnToggleAdmin}
        onRemoveMember={mockOnRemoveMember}
      />
    );

    const makeAdminOption = screen.getByText('Make Admin');
    fireEvent.click(makeAdminOption);

    expect(mockOnToggleAdmin).toHaveBeenCalledWith(mockMember);
  });

  it('calls onRemoveMember when remove option is clicked', () => {
    const anchorEl = document.createElement('div');

    render(
      <MemberActionsMenu
        anchorEl={anchorEl}
        member={mockMember}
        onClose={mockOnClose}
        onToggleAdmin={mockOnToggleAdmin}
        onRemoveMember={mockOnRemoveMember}
      />
    );

    const removeOption = screen.getByText('Remove from Group');
    fireEvent.click(removeOption);

    expect(mockOnRemoveMember).toHaveBeenCalledWith(mockMember);
  });

  it('does not render menu items when member is null', () => {
    const anchorEl = document.createElement('div');

    render(
      <MemberActionsMenu
        anchorEl={anchorEl}
        member={null}
        onClose={mockOnClose}
        onToggleAdmin={mockOnToggleAdmin}
        onRemoveMember={mockOnRemoveMember}
      />
    );

    expect(screen.queryByText('Make Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove from Group')).not.toBeInTheDocument();
  });
});
