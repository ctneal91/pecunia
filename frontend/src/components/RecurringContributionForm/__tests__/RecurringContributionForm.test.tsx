import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import RecurringContributionForm from '../RecurringContributionForm';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('RecurringContributionForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', () => {
    renderWithTheme(
      <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
  });

  it('shows create and cancel buttons', () => {
    renderWithTheme(
      <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('Create Recurring')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    renderWithTheme(
      <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates amount must be greater than 0', async () => {
    renderWithTheme(
      <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '0' } });
    fireEvent.click(screen.getByText('Create Recurring'));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid amount greater than 0/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    renderWithTheme(
      <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '100' } });

    fireEvent.click(screen.getByText('Create Recurring'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100,
          frequency: 'monthly',
        })
      );
    });
  });

  it('allows changing frequency', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    renderWithTheme(
      <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '50' } });

    const frequencySelect = screen.getByLabelText(/frequency/i);
    fireEvent.mouseDown(frequencySelect);
    fireEvent.click(screen.getByText('Weekly'));

    fireEvent.click(screen.getByText('Create Recurring'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50,
          frequency: 'weekly',
        })
      );
    });
  });

  it('shows loading state', () => {
    renderWithTheme(
      <RecurringContributionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByText('Creating...')).toBeDisabled();
  });

  it('disables submit when amount is empty', () => {
    renderWithTheme(
      <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('Create Recurring')).toBeDisabled();
  });

  it('enables submit when amount is entered', () => {
    renderWithTheme(
      <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '100' } });

    expect(screen.getByText('Create Recurring')).not.toBeDisabled();
  });
});
