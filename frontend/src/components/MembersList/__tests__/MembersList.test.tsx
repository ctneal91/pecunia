import { render, screen, fireEvent } from '@testing-library/react';
import MembersList from '../MembersList';
import { Membership } from '../../../types/group';

const mockMembers: Membership[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'John Doe',
    user_email: 'john@example.com',
    role: 'admin',
    joined_at: '2024-01-01',
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Jane Smith',
    user_email: 'jane@example.com',
    role: 'member',
    joined_at: '2024-01-02',
  },
  {
    id: 3,
    user_id: 3,
    user_name: 'Bob Johnson',
    user_email: 'bob@example.com',
    role: 'member',
    joined_at: '2024-01-03',
  },
];

describe('MembersList', () => {
  const mockOnMemberMenuOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all members', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId={1}
        isAdmin={true}
        onMemberMenuOpen={mockOnMemberMenuOpen}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('displays admin chip for admin members', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId={1}
        isAdmin={true}
        onMemberMenuOpen={mockOnMemberMenuOpen}
      />
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows menu button for other members when user is admin', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId={1}
        isAdmin={true}
        onMemberMenuOpen={mockOnMemberMenuOpen}
      />
    );

    const menuButtons = screen.getAllByRole('button');
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  it('does not show menu button for current user', () => {
    render(
      <MembersList
        members={[mockMembers[0]]}
        currentUserId={1}
        isAdmin={true}
        onMemberMenuOpen={mockOnMemberMenuOpen}
      />
    );

    const menuButtons = screen.queryAllByRole('button');
    expect(menuButtons.length).toBe(0);
  });

  it('does not show menu buttons when user is not admin', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId={2}
        isAdmin={false}
        onMemberMenuOpen={mockOnMemberMenuOpen}
      />
    );

    const menuButtons = screen.queryAllByRole('button');
    expect(menuButtons.length).toBe(0);
  });

  it('calls onMemberMenuOpen when menu button is clicked', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId={1}
        isAdmin={true}
        onMemberMenuOpen={mockOnMemberMenuOpen}
      />
    );

    const menuButtons = screen.getAllByRole('button');
    fireEvent.click(menuButtons[0]);

    expect(mockOnMemberMenuOpen).toHaveBeenCalled();
    expect(mockOnMemberMenuOpen.mock.calls[0][1]).toEqual(mockMembers[1]);
  });

  it('displays member emails', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId={1}
        isAdmin={true}
        onMemberMenuOpen={mockOnMemberMenuOpen}
      />
    );

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });
});
