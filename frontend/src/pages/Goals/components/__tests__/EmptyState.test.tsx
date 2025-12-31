import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders empty state message', () => {
    const mockOnCreate = jest.fn();
    render(<EmptyState isAuthenticated={false} onCreateClick={mockOnCreate} />);

    expect(screen.getByText('No goals yet')).toBeInTheDocument();
    expect(screen.getByText(/Start tracking your financial goals/i)).toBeInTheDocument();
  });

  it('shows browser storage message for unauthenticated users', () => {
    const mockOnCreate = jest.fn();
    render(<EmptyState isAuthenticated={false} onCreateClick={mockOnCreate} />);

    expect(screen.getByText(/Your goals will be saved in your browser/i)).toBeInTheDocument();
  });

  it('does not show browser storage message for authenticated users', () => {
    const mockOnCreate = jest.fn();
    render(<EmptyState isAuthenticated={true} onCreateClick={mockOnCreate} />);

    expect(screen.queryByText(/Your goals will be saved in your browser/i)).not.toBeInTheDocument();
  });

  it('calls onCreateClick when button clicked', async () => {
    const user = userEvent.setup();
    const mockOnCreate = jest.fn();
    render(<EmptyState isAuthenticated={false} onCreateClick={mockOnCreate} />);

    await user.click(screen.getByRole('button', { name: /Create Your First Goal/i }));

    expect(mockOnCreate).toHaveBeenCalledTimes(1);
  });
});
