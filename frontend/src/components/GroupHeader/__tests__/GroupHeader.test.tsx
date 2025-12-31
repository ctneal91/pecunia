import { render, screen, fireEvent } from '@testing-library/react';
import GroupHeader from '../GroupHeader';
import { GroupWithMembers } from '../../../types/group';

const mockGroup: GroupWithMembers = {
  id: 1,
  name: 'Test Group',
  invite_code: 'ABC123',
  is_admin: true,
  member_count: 5,
  goal_count: 3,
  members: [],
  created_at: '2024-01-01',
  updated_at: '2024-01-15',
};

describe('GroupHeader', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnLeave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders group name and stats', () => {
    render(
      <GroupHeader
        group={mockGroup}
        isAdmin={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('5 members · 3 goals')).toBeInTheDocument();
  });

  it('renders admin buttons when isAdmin is true', () => {
    render(
      <GroupHeader
        group={mockGroup}
        isAdmin={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByRole('button', { name: /edit group/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete group/i })).toBeInTheDocument();
    expect(screen.queryByText('Leave Group')).not.toBeInTheDocument();
  });

  it('renders leave button when isAdmin is false', () => {
    render(
      <GroupHeader
        group={mockGroup}
        isAdmin={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByText('Leave Group')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit group/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete group/i })).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <GroupHeader
        group={mockGroup}
        isAdmin={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onLeave={mockOnLeave}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit group/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <GroupHeader
        group={mockGroup}
        isAdmin={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onLeave={mockOnLeave}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete group/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onLeave when leave button is clicked', () => {
    render(
      <GroupHeader
        group={mockGroup}
        isAdmin={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onLeave={mockOnLeave}
      />
    );

    const leaveButton = screen.getByText('Leave Group');
    fireEvent.click(leaveButton);

    expect(mockOnLeave).toHaveBeenCalledTimes(1);
  });

  it('displays singular member and goal text correctly', () => {
    const singleGroup = {
      ...mockGroup,
      member_count: 1,
      goal_count: 1,
    };

    render(
      <GroupHeader
        group={singleGroup}
        isAdmin={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onLeave={mockOnLeave}
      />
    );

    expect(screen.getByText('1 member · 1 goal')).toBeInTheDocument();
  });
});
