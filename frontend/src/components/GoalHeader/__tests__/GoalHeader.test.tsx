import { render, screen, fireEvent } from '@testing-library/react';
import GoalHeader from '../GoalHeader';
import { Goal } from '../../../types/goal';

const mockGoal: Goal = {
  id: 1,
  title: 'Test Goal',
  description: 'Test Description',
  target_amount: 1000,
  current_amount: 500,
  target_date: '2024-12-31',
  goal_type: 'savings',
  icon: null,
  color: null,
  progress_percentage: 50,
  remaining_amount: 500,
  completed: false,
  milestones: [
    { percentage: 25, achieved_at: '2024-01-01T00:00:00Z' },
    { percentage: 75, achieved_at: '2024-01-15T00:00:00Z' },
  ],
  group_id: null,
  group_name: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-15',
};

const mockGroupGoal: Goal = {
  ...mockGoal,
  group_id: 5,
  group_name: 'Test Group',
};

describe('GoalHeader', () => {
  const mockOnExport = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders goal title and description', () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={false}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays progress bar with correct amounts', () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={false}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnExport}
      />
    );

    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('shows milestones when present', () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={false}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Milestones')).toBeInTheDocument();
    // Milestones display checkmarks for achieved percentages
    expect(screen.getByText(/25%/)).toBeInTheDocument();
  });

  it('displays target date', () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={false}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText(/Target date:/)).toBeInTheDocument();
  });

  it('shows group information for group goals', () => {
    render(
      <GoalHeader
        goal={mockGroupGoal}
        showExport={false}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText(/Shared goal in Test Group/)).toBeInTheDocument();
  });

  it('renders export button when showExport is true', () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={true}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('does not render export button when showExport is false', () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={false}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    const exportButton = screen.queryByRole('button', { name: /export/i });
    expect(exportButton).not.toBeInTheDocument();
  });

  it('calls onExport when export button is clicked', async () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={true}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={false}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('disables export button when exporting', () => {
    render(
      <GoalHeader
        goal={mockGoal}
        showExport={true}
        exporting={true}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    const exportButton = screen.getByRole('button', { name: /exporting/i });
    expect(exportButton).toBeDisabled();
  });

  it('displays amounts for completed goal', () => {
    const completedGoal = {
      ...mockGoal,
      completed: true,
      current_amount: 1000,
      remaining_amount: 0,
      progress_percentage: 100,
    };

    render(
      <GoalHeader
        goal={completedGoal}
        showExport={false}
        exporting={false}
        onExport={mockOnExport}
        onEdit={mockOnEdit}
      />
    );

    const amounts = screen.getAllByText('$1,000');
    expect(amounts.length).toBeGreaterThan(0);
  });
});
