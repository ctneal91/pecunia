import { render, screen } from '@testing-library/react';
import OverallStats from '../OverallStats';
import { CategoryStats } from '../../../../types/goal';

describe('OverallStats', () => {
  const mockCategories: CategoryStats[] = [
    {
      goal_type: 'emergency_fund',
      goal_count: 2,
      completed_count: 1,
      active_count: 1,
      total_saved: 5000,
      total_target: 10000,
      progress: 50,
      goals: [],
    },
    {
      goal_type: 'retirement',
      goal_count: 1,
      completed_count: 0,
      active_count: 1,
      total_saved: 2000,
      total_target: 5000,
      progress: 40,
      goals: [],
    },
  ];

  it('renders overall statistics', () => {
    render(<OverallStats categories={mockCategories} />);

    expect(screen.getByText('Overall Progress')).toBeInTheDocument();
    expect(screen.getByText('Total Saved')).toBeInTheDocument();
    expect(screen.getByText('$7,000')).toBeInTheDocument();
    expect(screen.getByText('Total Target')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
  });

  it('calculates total goals correctly', () => {
    render(<OverallStats categories={mockCategories} />);

    expect(screen.getByText('3')).toBeInTheDocument(); // 2 + 1 goals
  });

  it('calculates completed goals correctly', () => {
    render(<OverallStats categories={mockCategories} />);

    expect(screen.getByText('1')).toBeInTheDocument(); // 1 completed
  });

  it('calculates overall progress percentage', () => {
    render(<OverallStats categories={mockCategories} />);

    // 7000 / 15000 = 46.67% rounded to 47%
    expect(screen.getByText('47%')).toBeInTheDocument();
  });

  it('handles zero target amount', () => {
    const categoriesWithZeroTarget: CategoryStats[] = [
      {
        goal_type: 'emergency_fund',
        goal_count: 1,
        completed_count: 0,
        active_count: 1,
        total_saved: 0,
        total_target: 0,
        progress: 0,
        goals: [],
      },
    ];

    render(<OverallStats categories={categoriesWithZeroTarget} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
