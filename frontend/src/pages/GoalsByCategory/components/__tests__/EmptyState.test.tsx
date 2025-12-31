import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders empty state message', () => {
    const mockCreateGoal = jest.fn();
    render(<EmptyState onCreateGoal={mockCreateGoal} />);

    expect(screen.getByText('No goals yet')).toBeInTheDocument();
    expect(screen.getByText(/Start tracking your financial goals today/i)).toBeInTheDocument();
  });

  it('calls onCreateGoal when button is clicked', async () => {
    const user = userEvent.setup();
    const mockCreateGoal = jest.fn();
    render(<EmptyState onCreateGoal={mockCreateGoal} />);

    const button = screen.getByRole('button', { name: /Create Your First Goal/i });
    await user.click(button);

    expect(mockCreateGoal).toHaveBeenCalledTimes(1);
  });
});
