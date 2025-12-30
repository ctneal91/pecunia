import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import ProgressChart from '../ProgressChart';
import { Contribution, Milestone } from '../../../types/goal';

const theme = createTheme();

// Mock Recharts completely since ResponsiveContainer doesn't work in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockContributions: Contribution[] = [
  {
    id: 1,
    goal_id: 1,
    user_id: 1,
    amount: 100,
    note: 'First deposit',
    contributed_at: '2025-01-01T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    goal_id: 1,
    user_id: 1,
    amount: 150,
    note: 'Second deposit',
    contributed_at: '2025-01-15T00:00:00Z',
    created_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 3,
    goal_id: 1,
    user_id: 1,
    amount: 200,
    note: 'Third deposit',
    contributed_at: '2025-01-30T00:00:00Z',
    created_at: '2025-01-30T00:00:00Z',
  },
];

const mockMilestones: Milestone[] = [
  { percentage: 25, achieved_at: '2025-01-15T00:00:00Z' },
  { percentage: 50, achieved_at: '2025-01-30T00:00:00Z' },
];

describe('ProgressChart', () => {
  it('shows empty state when no contributions', () => {
    renderWithTheme(
      <ProgressChart
        contributions={[]}
        targetAmount={1000}
        currentAmount={0}
      />
    );
    expect(
      screen.getByText(/no contributions yet/i)
    ).toBeInTheDocument();
  });

  it('renders chart container when contributions exist', () => {
    renderWithTheme(
      <ProgressChart
        contributions={mockContributions}
        targetAmount={1000}
        currentAmount={450}
      />
    );
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('renders with milestones', () => {
    renderWithTheme(
      <ProgressChart
        contributions={mockContributions}
        milestones={mockMilestones}
        targetAmount={1000}
        currentAmount={450}
      />
    );
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles contributions on same day', () => {
    const sameDayContributions: Contribution[] = [
      {
        id: 1,
        goal_id: 1,
        user_id: 1,
        amount: 100,
        note: null,
        contributed_at: '2025-01-15T10:00:00Z',
        created_at: '2025-01-15T10:00:00Z',
      },
      {
        id: 2,
        goal_id: 1,
        user_id: 1,
        amount: 50,
        note: null,
        contributed_at: '2025-01-15T14:00:00Z',
        created_at: '2025-01-15T14:00:00Z',
      },
    ];

    renderWithTheme(
      <ProgressChart
        contributions={sameDayContributions}
        targetAmount={1000}
        currentAmount={150}
      />
    );
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('handles withdrawals correctly', () => {
    const contributionsWithWithdrawal: Contribution[] = [
      {
        id: 1,
        goal_id: 1,
        user_id: 1,
        amount: 500,
        note: null,
        contributed_at: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 2,
        goal_id: 1,
        user_id: 1,
        amount: -100,
        note: 'Withdrawal',
        contributed_at: '2025-01-15T00:00:00Z',
        created_at: '2025-01-15T00:00:00Z',
      },
    ];

    renderWithTheme(
      <ProgressChart
        contributions={contributionsWithWithdrawal}
        targetAmount={1000}
        currentAmount={400}
      />
    );
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
