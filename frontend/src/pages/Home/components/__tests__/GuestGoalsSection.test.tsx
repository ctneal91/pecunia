import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import GuestGoalsSection from '../GuestGoalsSection';
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

describe('GuestGoalsSection', () => {
  const mockOnViewAll = jest.fn();
  const mockOnGoalClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the section title', () => {
    renderWithTheme(
      <GuestGoalsSection goals={[]} onViewAll={mockOnViewAll} onGoalClick={mockOnGoalClick} />
    );

    expect(screen.getByText('Your Goals')).toBeInTheDocument();
  });

  it('renders View All button', () => {
    renderWithTheme(
      <GuestGoalsSection goals={[]} onViewAll={mockOnViewAll} onGoalClick={mockOnGoalClick} />
    );

    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('calls onViewAll when View All button is clicked', () => {
    renderWithTheme(
      <GuestGoalsSection goals={[]} onViewAll={mockOnViewAll} onGoalClick={mockOnGoalClick} />
    );

    fireEvent.click(screen.getByText('View All'));
    expect(mockOnViewAll).toHaveBeenCalledTimes(1);
  });

  it('renders goal items when goals are provided', () => {
    const goals = [mockGoal, { ...mockGoal, id: 2, title: 'Test Goal 2' }];

    renderWithTheme(
      <GuestGoalsSection goals={goals} onViewAll={mockOnViewAll} onGoalClick={mockOnGoalClick} />
    );

    const goalElements = screen.getAllByText(/Test Goal/);
    expect(goalElements).toHaveLength(2);
  });

  it('calls onGoalClick with correct goal id when goal item is clicked', () => {
    renderWithTheme(
      <GuestGoalsSection
        goals={[mockGoal]}
        onViewAll={mockOnViewAll}
        onGoalClick={mockOnGoalClick}
      />
    );

    const goalElement = screen.getByText(/Test Goal/).closest('.MuiBox-root');
    if (goalElement) {
      fireEvent.click(goalElement);
    }
    expect(mockOnGoalClick).toHaveBeenCalledWith('1');
  });

  it('renders only first 3 goals when more than 3 goals are provided', () => {
    const goals = [
      mockGoal,
      { ...mockGoal, id: 2, title: 'Test Goal 2' },
      { ...mockGoal, id: 3, title: 'Test Goal 3' },
      { ...mockGoal, id: 4, title: 'Test Goal 4' },
      { ...mockGoal, id: 5, title: 'Test Goal 5' },
    ];

    renderWithTheme(
      <GuestGoalsSection goals={goals} onViewAll={mockOnViewAll} onGoalClick={mockOnGoalClick} />
    );

    expect(screen.getByText(/^💰\s+Test Goal$/)).toBeInTheDocument();
    expect(screen.getByText(/^💰\s+Test Goal 2$/)).toBeInTheDocument();
    expect(screen.getByText(/^💰\s+Test Goal 3$/)).toBeInTheDocument();
    expect(screen.queryByText(/Test Goal 4/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Test Goal 5/)).not.toBeInTheDocument();
  });
});
