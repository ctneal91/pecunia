import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupCard from '../GroupCard';
import { Group } from '../../../../types/group';

describe('GroupCard', () => {
  const mockGroup: Group = {
    id: 1,
    name: 'Family',
    member_count: 3,
    goal_count: 5,
    is_admin: true,
    invite_code: 'ABC123',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  };

  it('renders group information', () => {
    const mockOnClick = jest.fn();
    render(<GroupCard group={mockGroup} onClick={mockOnClick} />);

    expect(screen.getByText('Family')).toBeInTheDocument();
    expect(screen.getByText(/3 members/i)).toBeInTheDocument();
    expect(screen.getByText(/5 goals/i)).toBeInTheDocument();
  });

  it('shows Admin badge for admin users', () => {
    const mockOnClick = jest.fn();
    render(<GroupCard group={mockGroup} onClick={mockOnClick} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();
    render(<GroupCard group={mockGroup} onClick={mockOnClick} />);

    await user.click(screen.getByText('Family'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
