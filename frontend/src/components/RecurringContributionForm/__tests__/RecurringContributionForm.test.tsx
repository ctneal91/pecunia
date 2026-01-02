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

  // Tests for lines 41-42: Start date validation
  describe('Start date validation (lines 41-42)', () => {
    it('validates that start date is required', async () => {
      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      const startDateInput = screen.getByLabelText(/start date/i);
      fireEvent.change(startDateInput, { target: { value: '' } });

      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(screen.getByText(/please select a start date/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not show start date error when date is provided', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      const startDateInput = screen.getByLabelText(/start date/i);
      fireEvent.change(startDateInput, { target: { value: '2025-02-01' } });

      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      expect(screen.queryByText(/please select a start date/i)).not.toBeInTheDocument();
    });
  });

  // Tests for line 53: End date handling
  describe('End date handling (line 53)', () => {
    it('includes end_date when endDate is provided', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      const endDateInput = screen.getByLabelText(/end date/i);
      fireEvent.change(endDateInput, { target: { value: '2025-12-31' } });

      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 100,
            end_date: expect.stringContaining('2025-12-31'),
          })
        );
      });
    });

    it('does not include end_date when endDate is empty', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs.end_date).toBeUndefined();
    });
  });

  // Tests for line 59: Error handling on submission failure
  describe('Submission error handling (line 59)', () => {
    it('shows error message when submission fails', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Network error'));

      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(screen.getByText(/failed to create recurring contribution/i)).toBeInTheDocument();
      });
    });

    it('clears previous error when submitting again', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('Network error'));
      mockOnSubmit.mockResolvedValueOnce(undefined);

      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      // First submission fails
      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(screen.getByText(/failed to create recurring contribution/i)).toBeInTheDocument();
      });

      // Second submission succeeds
      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(screen.queryByText(/failed to create recurring contribution/i)).not.toBeInTheDocument();
      });
    });
  });

  // Tests for lines 105-125: Form field rendering and interaction
  describe('Form fields rendering (lines 105-125)', () => {
    it('renders start date field with correct attributes', () => {
      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      expect(startDateInput).toHaveAttribute('type', 'date');
      expect(startDateInput).toBeRequired();
      expect(startDateInput.value).toBeTruthy(); // Should have default value
    });

    it('renders end date field with correct attributes', () => {
      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
      expect(endDateInput).toHaveAttribute('type', 'date');
      expect(endDateInput).not.toBeRequired();
      expect(screen.getByText(/leave empty for no end date/i)).toBeInTheDocument();
    });

    it('renders note field with correct attributes', () => {
      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const noteInput = screen.getByLabelText(/note/i) as HTMLInputElement;
      expect(noteInput).not.toBeRequired();
      expect(noteInput).toHaveValue('');
    });

    it('updates start date value when changed', () => {
      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      fireEvent.change(startDateInput, { target: { value: '2025-03-15' } });

      expect(startDateInput.value).toBe('2025-03-15');
    });

    it('updates end date value when changed', () => {
      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
      fireEvent.change(endDateInput, { target: { value: '2025-12-31' } });

      expect(endDateInput.value).toBe('2025-12-31');
    });

    it('updates note value when changed', () => {
      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const noteInput = screen.getByLabelText(/note/i) as HTMLInputElement;
      fireEvent.change(noteInput, { target: { value: 'Monthly savings' } });

      expect(noteInput.value).toBe('Monthly savings');
    });

    it('includes note in submission when provided', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      const noteInput = screen.getByLabelText(/note/i);
      fireEvent.change(noteInput, { target: { value: 'Retirement fund' } });

      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            note: 'Retirement fund',
          })
        );
      });
    });

    it('does not include note in submission when empty', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      renderWithTheme(
        <RecurringContributionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100' } });

      fireEvent.click(screen.getByText('Create Recurring'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs.note).toBeUndefined();
    });
  });
});
