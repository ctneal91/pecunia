import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import ProgressChart from '../ProgressChart';
import { Contribution, Milestone } from '../../../types/goal';
import { formatCurrency } from '../../../utils/formatters';

const theme = createTheme();

// Types for captured chart component props
interface CapturedAxisProps {
  dataKey?: string;
  tickFormatter?: (value: string | number) => string;
  domain?: [number, number];
  tick?: object;
  stroke?: string;
}

interface CapturedTooltipProps {
  formatter?: (value: number) => [string, string];
  labelFormatter?: (label: string) => string;
  contentStyle?: {
    backgroundColor: string;
    border: string;
    borderRadius: number;
  };
}

// Store props passed to mocked components for testing
let capturedXAxisProps: CapturedAxisProps | null = null;
let capturedYAxisProps: CapturedAxisProps | null = null;
let capturedTooltipProps: CapturedTooltipProps | null = null;

// Mock Recharts completely since ResponsiveContainer doesn't work in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: (props: CapturedAxisProps) => {
    capturedXAxisProps = props;
    return <div data-testid="x-axis" />;
  },
  YAxis: (props: CapturedAxisProps) => {
    capturedYAxisProps = props;
    return <div data-testid="y-axis" />;
  },
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: (props: CapturedTooltipProps) => {
    capturedTooltipProps = props;
    return <div data-testid="tooltip" />;
  },
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

const renderWithTheme = (component: React.ReactElement) => {
  // Reset captured props before each render
  capturedXAxisProps = null;
  capturedYAxisProps = null;
  capturedTooltipProps = null;
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

  // Tests for line 30: formatDateShort function
  describe('XAxis date formatting (line 30)', () => {
    it('formats dates correctly using formatDateShort', () => {
      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={1000}
          currentAmount={450}
        />
      );

      // Test the tickFormatter function passed to XAxis
      expect(capturedXAxisProps).not.toBeNull();
      expect(capturedXAxisProps!.tickFormatter).toBeDefined();

      // Test various date formats using UTC timestamps to avoid timezone issues
      const formattedDate1 = capturedXAxisProps!.tickFormatter!('2025-01-01T12:00:00Z');
      expect(formattedDate1).toBe('Jan 1');

      const formattedDate2 = capturedXAxisProps!.tickFormatter!('2025-12-31T12:00:00Z');
      expect(formattedDate2).toBe('Dec 31');

      const formattedDate3 = capturedXAxisProps!.tickFormatter!('2025-06-15T12:00:00Z');
      expect(formattedDate3).toBe('Jun 15');
    });

    it('uses formatDateShort on XAxis dataKey', () => {
      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={1000}
          currentAmount={450}
        />
      );

      expect(capturedXAxisProps!.dataKey).toBe('date');
      expect(capturedXAxisProps!.tickFormatter).toBeDefined();
    });
  });

  // Tests for lines 113-120: YAxis and Tooltip configuration
  describe('YAxis configuration (lines 113-116)', () => {
    it('formats YAxis ticks with formatCurrency', () => {
      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={1000}
          currentAmount={450}
        />
      );

      expect(capturedYAxisProps).not.toBeNull();
      expect(capturedYAxisProps!.tickFormatter).toBeDefined();

      // Test the tickFormatter function
      const formatted1 = capturedYAxisProps!.tickFormatter!(1000);
      expect(formatted1).toBe(formatCurrency(1000));

      const formatted2 = capturedYAxisProps!.tickFormatter!(450.50);
      expect(formatted2).toBe(formatCurrency(450.50));

      const formatted3 = capturedYAxisProps!.tickFormatter!(0);
      expect(formatted3).toBe(formatCurrency(0));
    });

    it('sets correct YAxis domain when currentAmount exceeds targetAmount', () => {
      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={1000}
          currentAmount={1500}
        />
      );

      expect(capturedYAxisProps!.domain).toEqual([0, 1500 * 1.1]);
    });

    it('sets correct YAxis domain when targetAmount exceeds currentAmount', () => {
      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={2000}
          currentAmount={450}
        />
      );

      expect(capturedYAxisProps!.domain).toEqual([0, 2000 * 1.1]);
    });

    it('calculates YAxis domain with 10% buffer', () => {
      const targetAmount = 1000;
      const currentAmount = 800;
      const maxValue = Math.max(targetAmount, currentAmount);

      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={targetAmount}
          currentAmount={currentAmount}
        />
      );

      expect(capturedYAxisProps!.domain).toEqual([0, maxValue * 1.1]);
      expect(capturedYAxisProps!.domain![1]).toBe(1100); // 1000 * 1.1
    });
  });

  describe('Tooltip configuration (lines 118-120)', () => {
    it('formats tooltip value with formatCurrency', () => {
      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={1000}
          currentAmount={450}
        />
      );

      expect(capturedTooltipProps).not.toBeNull();
      expect(capturedTooltipProps!.formatter).toBeDefined();

      // Test the formatter function
      const result1 = capturedTooltipProps!.formatter!(450);
      expect(result1).toEqual([formatCurrency(450), 'Total Saved']);

      const result2 = capturedTooltipProps!.formatter!(1234.56);
      expect(result2).toEqual([formatCurrency(1234.56), 'Total Saved']);

      const result3 = capturedTooltipProps!.formatter!(0);
      expect(result3).toEqual([formatCurrency(0), 'Total Saved']);
    });

    it('formats tooltip label with formatDateShort', () => {
      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={1000}
          currentAmount={450}
        />
      );

      expect(capturedTooltipProps!.labelFormatter).toBeDefined();

      // Test the labelFormatter function using UTC timestamps to avoid timezone issues
      const label1 = capturedTooltipProps!.labelFormatter!('2025-01-15T12:00:00Z');
      expect(label1).toBe('Jan 15');

      const label2 = capturedTooltipProps!.labelFormatter!('2025-12-25T12:00:00Z');
      expect(label2).toBe('Dec 25');
    });

    it('applies correct tooltip content styling', () => {
      renderWithTheme(
        <ProgressChart
          contributions={mockContributions}
          targetAmount={1000}
          currentAmount={450}
        />
      );

      expect(capturedTooltipProps!.contentStyle).toBeDefined();
      expect(capturedTooltipProps!.contentStyle!.backgroundColor).toBe(
        theme.palette.background.paper
      );
      expect(capturedTooltipProps!.contentStyle!.border).toBe(
        `1px solid ${theme.palette.divider}`
      );
      expect(capturedTooltipProps!.contentStyle!.borderRadius).toBe(8);
    });
  });
});
