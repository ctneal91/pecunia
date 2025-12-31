import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotFoundState from '../NotFoundState';

describe('NotFoundState', () => {
  it('renders error message', () => {
    const mockOnBack = jest.fn();
    render(<NotFoundState error="Group not found" onBackToGroups={mockOnBack} />);

    expect(screen.getByText('Group not found')).toBeInTheDocument();
  });

  it('calls onBackToGroups when back button clicked', async () => {
    const user = userEvent.setup();
    const mockOnBack = jest.fn();
    render(<NotFoundState error="Group not found" onBackToGroups={mockOnBack} />);

    await user.click(screen.getByRole('button', { name: /Back to Groups/i }));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
