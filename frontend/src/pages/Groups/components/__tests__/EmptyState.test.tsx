import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders empty state message', () => {
    const mockOnCreate = jest.fn();
    const mockOnJoin = jest.fn();
    render(<EmptyState onCreateGroup={mockOnCreate} onJoinGroup={mockOnJoin} />);

    expect(screen.getByText('No Groups Yet')).toBeInTheDocument();
    expect(screen.getByText(/Create a group to share goals/i)).toBeInTheDocument();
  });

  it('calls onCreateGroup when Create Group button clicked', async () => {
    const user = userEvent.setup();
    const mockOnCreate = jest.fn();
    const mockOnJoin = jest.fn();
    render(<EmptyState onCreateGroup={mockOnCreate} onJoinGroup={mockOnJoin} />);

    await user.click(screen.getByRole('button', { name: /Create Group/i }));

    expect(mockOnCreate).toHaveBeenCalledTimes(1);
  });

  it('calls onJoinGroup when Join button clicked', async () => {
    const user = userEvent.setup();
    const mockOnCreate = jest.fn();
    const mockOnJoin = jest.fn();
    render(<EmptyState onCreateGroup={mockOnCreate} onJoinGroup={mockOnJoin} />);

    await user.click(screen.getByRole('button', { name: /Join with Invite Code/i }));

    expect(mockOnJoin).toHaveBeenCalledTimes(1);
  });
});
