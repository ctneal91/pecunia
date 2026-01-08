import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import GoalsProgressSection from '../GoalsProgressSection';
import { Goal } from '../../../../types/goal';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockGoal: Goal = {
  id: 1,
  user_id: 1,
  title: 'Test Goal',
  target_amount: 1000,
  current_amount: 500,
  goal_type: 'savings',
  category: 'general',
  description: null,
  target_date: null,
  is_completed: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('GoalsProgressSection', () => {
  const mockOnViewAll = jest.fn();
  const mockOnGoalClick = jest.fn();
  const mockOnCreateGoal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the section title', () => {
    renderWithTheme(
      <GoalsProgressSection
        goals={[]}
        onViewAll={mockOnViewAll}
        onGoalClick={mockOnGoalClick}
        onCreateGoal={mockOnCreateGoal}
      />
    );

    expect(screen.getByText('Goals Progress')).toBeInTheDocument();
  });

  it('renders View All button', () => {
    renderWithTheme(
      <GoalsProgressSection
        goals={[]}
        onViewAll={mockOnViewAll}
        onGoalClick={mockOnGoalClick}
        onCreateGoal={mockOnCreateGoal}
      />
    );

    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('calls onViewAll when View All button is clicked', () => {
    renderWithTheme(
      <GoalsProgressSection
        goals={[]}
        onViewAll={mockOnViewAll}
        onGoalClick={mockOnGoalClick}
        onCreateGoal={mockOnCreateGoal}
      />
    );

    fireEvent.click(screen.getByText('View All'));
    expect(mockOnViewAll).toHaveBeenCalledTimes(1);
  });

  it('renders NoGoalsState when goals array is empty', () => {
    renderWithTheme(
      <GoalsProgressSection
        goals={[]}
        onViewAll={mockOnViewAll}
        onGoalClick={mockOnGoalClick}
        onCreateGoal={mockOnCreateGoal}
      />
    );

    expect(screen.getByText(/no goals yet/i)).toBeInTheDocument();
  });

  it('renders goal items when goals are provided', () => {
    const goals = [mockGoal, { ...mockGoal, id: 2, title: 'Test Goal 2' }];

    renderWithTheme(
      <GoalsProgressSection
        goals={goals}
        onViewAll={mockOnViewAll}
        onGoalClick={mockOnGoalClick}
        onCreateGoal={mockOnCreateGoal}
      />
    );

    const goalElements = screen.getAllByText(/Test Goal/);
    expect(goalElements).toHaveLength(2);
  });

  it('calls onGoalClick with correct goal id when goal item is clicked', () => {
    renderWithTheme(
      <GoalsProgressSection
        goals={[mockGoal]}
        onViewAll={mockOnViewAll}
        onGoalClick={mockOnGoalClick}
        onCreateGoal={mockOnCreateGoal}
      />
    );

    const goalElement = screen.getByText(/Test Goal/).closest('.MuiBox-root');
    if (goalElement) {
      fireEvent.click(goalElement);
    }
    expect(mockOnGoalClick).toHaveBeenCalledWith('1');
  });

  it('calls onCreateGoal when Create Goal button in NoGoalsState is clicked', () => {
    renderWithTheme(
      <GoalsProgressSection
        goals={[]}
        onViewAll={mockOnViewAll}
        onGoalClick={mockOnGoalClick}
        onCreateGoal={mockOnCreateGoal}
      />
    );

    fireEvent.click(screen.getByText(/create goal/i));
    expect(mockOnCreateGoal).toHaveBeenCalledTimes(1);
  });
});
