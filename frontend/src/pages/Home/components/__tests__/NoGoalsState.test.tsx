import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoGoalsState from '../NoGoalsState';

describe('NoGoalsState', () => {
  it('renders no goals message', () => {
    const mockOnCreate = jest.fn();
    render(<NoGoalsState onCreateGoal={mockOnCreate} />);

    expect(screen.getByText('No goals yet')).toBeInTheDocument();
  });

  it('calls onCreateGoal when button clicked', async () => {
    const user = userEvent.setup();
    const mockOnCreate = jest.fn();
    render(<NoGoalsState onCreateGoal={mockOnCreate} />);

    await user.click(screen.getByRole('button', { name: /Create Goal/i }));

    expect(mockOnCreate).toHaveBeenCalledTimes(1);
  });
});
