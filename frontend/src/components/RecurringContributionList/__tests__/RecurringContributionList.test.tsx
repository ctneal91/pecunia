import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import RecurringContributionList from '../RecurringContributionList';
import { RecurringContribution } from '../../../types/goal';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const createRecurringContribution = (
  overrides: Partial<RecurringContribution> = {}
): RecurringContribution => ({
  id: 1,
  goal_id: 1,
  user_id: 1,
  amount: 100,
  frequency: 'monthly',
  next_occurrence_at: '2025-02-01T00:00:00Z',
  end_date: null,
  is_active: true,
  note: null,
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('RecurringContributionList', () => {
  const mockOnToggleActive = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no recurring contributions', () => {
    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/no recurring contributions set up yet/i)).toBeInTheDocument();
  });

  it('displays recurring contribution details', () => {
    const rc = createRecurringContribution({
      amount: 150,
      frequency: 'weekly',
    });

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[rc]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('shows next occurrence date', () => {
    const rc = createRecurringContribution({
      next_occurrence_at: '2025-02-15T12:00:00Z',
    });

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[rc]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/next:/i)).toBeInTheDocument();
    // Date may show as 14 or 15 depending on timezone
    expect(screen.getByText(/feb 1[45], 2025/i)).toBeInTheDocument();
  });

  it('shows end date when present', () => {
    const rc = createRecurringContribution({
      end_date: '2025-12-31T00:00:00Z',
    });

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[rc]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/ends:/i)).toBeInTheDocument();
  });

  it('shows note when present', () => {
    const rc = createRecurringContribution({
      note: 'Monthly savings',
    });

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[rc]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/monthly savings/i)).toBeInTheDocument();
  });

  it('shows paused chip for inactive contribution', () => {
    const rc = createRecurringContribution({
      is_active: false,
    });

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[rc]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('calls onToggleActive when pause button clicked', () => {
    const rc = createRecurringContribution({ is_active: true });

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[rc]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    expect(mockOnToggleActive).toHaveBeenCalledWith(1, false);
  });

  it('calls onToggleActive when resume button clicked', () => {
    const rc = createRecurringContribution({ is_active: false });

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[rc]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    const resumeButton = screen.getByRole('button', { name: /resume/i });
    fireEvent.click(resumeButton);

    expect(mockOnToggleActive).toHaveBeenCalledWith(1, true);
  });

  it('calls onDelete when delete button clicked', () => {
    const rc = createRecurringContribution();

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={[rc]}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('displays multiple recurring contributions', () => {
    const contributions = [
      createRecurringContribution({ id: 1, amount: 100, frequency: 'monthly' }),
      createRecurringContribution({ id: 2, amount: 50, frequency: 'weekly' }),
    ];

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={contributions}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('displays all frequency types correctly', () => {
    const contributions = [
      createRecurringContribution({ id: 1, frequency: 'daily' }),
      createRecurringContribution({ id: 2, frequency: 'weekly' }),
      createRecurringContribution({ id: 3, frequency: 'biweekly' }),
      createRecurringContribution({ id: 4, frequency: 'monthly' }),
    ];

    renderWithTheme(
      <RecurringContributionList
        recurringContributions={contributions}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Bi-weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });
});
