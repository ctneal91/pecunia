import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotFoundState from '../NotFoundState';

describe('NotFoundState', () => {
  it('renders error message', () => {
    const mockBackToGoals = jest.fn();
    render(<NotFoundState onBackToGoals={mockBackToGoals} />);

    expect(screen.getByText(/Goal not found/i)).toBeInTheDocument();
  });

  it('calls onBackToGoals when button is clicked', async () => {
    const user = userEvent.setup();
    const mockBackToGoals = jest.fn();
    render(<NotFoundState onBackToGoals={mockBackToGoals} />);

    const button = screen.getByRole('button', { name: /Back to Goals/i });
    await user.click(button);

    expect(mockBackToGoals).toHaveBeenCalledTimes(1);
  });
});
