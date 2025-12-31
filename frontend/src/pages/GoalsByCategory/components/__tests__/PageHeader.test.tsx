import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('renders header with title and buttons', () => {
    const mockListView = jest.fn();
    const mockNewGoal = jest.fn();
    render(<PageHeader onListView={mockListView} onNewGoal={mockNewGoal} />);

    expect(screen.getByText('Goals by Category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /List View/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Goal/i })).toBeInTheDocument();
  });

  it('calls onListView when List View button is clicked', async () => {
    const user = userEvent.setup();
    const mockListView = jest.fn();
    const mockNewGoal = jest.fn();
    render(<PageHeader onListView={mockListView} onNewGoal={mockNewGoal} />);

    const button = screen.getByRole('button', { name: /List View/i });
    await user.click(button);

    expect(mockListView).toHaveBeenCalledTimes(1);
  });

  it('calls onNewGoal when New Goal button is clicked', async () => {
    const user = userEvent.setup();
    const mockListView = jest.fn();
    const mockNewGoal = jest.fn();
    render(<PageHeader onListView={mockListView} onNewGoal={mockNewGoal} />);

    const button = screen.getByRole('button', { name: /New Goal/i });
    await user.click(button);

    expect(mockNewGoal).toHaveBeenCalledTimes(1);
  });
});
