import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalItem from '../GoalItem';
import { Goal } from '../../../../types/goal';

describe('GoalItem', () => {
  const mockGoal: Goal = {
    id: 1,
    title: 'Emergency Fund',
    target_amount: 10000,
    current_amount: 5000,
    progress_percentage: 50,
    completed: false,
    group_name: 'My Group',
    goal_type: 'emergency',
    target_date: null,
    description: null,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  };

  it('renders goal information', () => {
    const mockClick = jest.fn();
    render(<GoalItem goal={mockGoal} onClick={mockClick} />);

    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('My Group')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText(/\$5,000 of \$10,000/i)).toBeInTheDocument();
  });

  it('renders without group name', () => {
    const mockClick = jest.fn();
    const goalWithoutGroup = { ...mockGoal, group_name: null };
    render(<GoalItem goal={goalWithoutGroup} onClick={mockClick} />);

    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.queryByText('My Group')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const mockClick = jest.fn();
    render(<GoalItem goal={mockGoal} onClick={mockClick} />);

    const goalItem = screen.getByText('Emergency Fund').closest('div')?.parentElement;
    if (goalItem) {
      await user.click(goalItem);
      expect(mockClick).toHaveBeenCalledTimes(1);
    }
  });
});
