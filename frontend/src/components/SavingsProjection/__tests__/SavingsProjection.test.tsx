import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import SavingsProjection from '../SavingsProjection';
import { Contribution } from '../../../types/goal';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const createContribution = (
  id: number,
  amount: number,
  daysAgo: number
): Contribution => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id,
    goal_id: 1,
    user_id: 1,
    amount,
    note: null,
    contributed_at: date.toISOString(),
    created_at: date.toISOString(),
  };
};

describe('SavingsProjection', () => {
  it('shows empty state when no contributions', () => {
    renderWithTheme(
      <SavingsProjection
        contributions={[]}
        targetAmount={1000}
        currentAmount={0}
      />
    );
    expect(
      screen.getByText(/add contributions to see savings projections/i)
    ).toBeInTheDocument();
  });

  it('displays monthly savings rate', () => {
    const contributions = [
      createContribution(1, 100, 30),
      createContribution(2, 100, 15),
      createContribution(3, 100, 0),
    ];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={1000}
        currentAmount={300}
      />
    );

    expect(screen.getByText('Monthly Rate')).toBeInTheDocument();
  });

  it('displays contribution frequency', () => {
    const contributions = [
      createContribution(1, 100, 14),
      createContribution(2, 100, 7),
      createContribution(3, 100, 0),
    ];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={1000}
        currentAmount={300}
      />
    );

    expect(screen.getByText('Frequency')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('shows estimated completion date', () => {
    const contributions = [
      createContribution(1, 100, 30),
      createContribution(2, 100, 0),
    ];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={1000}
        currentAmount={200}
      />
    );

    expect(screen.getByText('Estimated Completion')).toBeInTheDocument();
    expect(screen.getByText(/days remaining/i)).toBeInTheDocument();
  });

  it('shows goal complete message when goal is reached', () => {
    const contributions = [
      createContribution(1, 500, 30),
      createContribution(2, 500, 0),
    ];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={1000}
        currentAmount={1000}
      />
    );

    expect(screen.getByText('Goal Complete!')).toBeInTheDocument();
  });

  it('shows on-track status when ahead of target date', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const contributions = [
      createContribution(1, 500, 7),
      createContribution(2, 400, 0),
    ];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={1000}
        currentAmount={900}
        targetDate={futureDate.toISOString()}
      />
    );

    expect(
      screen.getByText(/you're on track to reach your goal/i)
    ).toBeInTheDocument();
  });

  it('shows required monthly amount when behind target date', () => {
    const nearFutureDate = new Date();
    nearFutureDate.setDate(nearFutureDate.getDate() + 30);

    const contributions = [
      createContribution(1, 100, 30),
    ];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={10000}
        currentAmount={100}
        targetDate={nearFutureDate.toISOString()}
      />
    );

    expect(
      screen.getByText(/to reach your goal by the target date/i)
    ).toBeInTheDocument();
    // Multiple /month elements exist (required amount and current rate), so use getAllBy
    const monthlyElements = screen.getAllByText(/\/month/);
    expect(monthlyElements.length).toBeGreaterThan(0);
  });

  it('displays contribution count summary', () => {
    const contributions = [
      createContribution(1, 100, 10),
      createContribution(2, 100, 5),
      createContribution(3, 100, 0),
    ];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={1000}
        currentAmount={300}
      />
    );

    expect(screen.getByText(/3 contributions/i)).toBeInTheDocument();
  });

  it('handles single contribution', () => {
    const contributions = [createContribution(1, 100, 0)];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={1000}
        currentAmount={100}
      />
    );

    expect(screen.getByText('Just started')).toBeInTheDocument();
  });

  it('handles withdrawals by excluding from rate calculation', () => {
    const contributions = [
      createContribution(1, 500, 30),
      createContribution(2, -100, 15),
      createContribution(3, 100, 0),
    ];

    renderWithTheme(
      <SavingsProjection
        contributions={contributions}
        targetAmount={1000}
        currentAmount={500}
      />
    );

    // Should show 2 contributions (excluding the withdrawal from positive count)
    expect(screen.getByText(/2 contributions/i)).toBeInTheDocument();
  });
});
