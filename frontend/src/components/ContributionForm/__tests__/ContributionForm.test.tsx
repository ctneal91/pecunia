import { render, screen, fireEvent } from '@testing-library/react';
import ContributionForm from '../ContributionForm';

describe('ContributionForm', () => {
  const mockOnAmountChange = jest.fn();
  const mockOnNoteChange = jest.fn();
  const mockOnWithdrawalToggle = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with deposit selected by default', () => {
    render(
      <ContributionForm
        amount=""
        note=""
        isWithdrawal={false}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Add Contribution')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deposit' })).toBeInTheDocument();
  });

  it('renders withdrawal mode correctly', () => {
    render(
      <ContributionForm
        amount="50"
        note="Test withdrawal"
        isWithdrawal={true}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent === 'Withdraw' && btn.getAttribute('type') === 'submit');
    expect(submitButton).toBeInTheDocument();
  });

  it('calls onWithdrawalToggle when deposit chip is clicked', () => {
    render(
      <ContributionForm
        amount=""
        note=""
        isWithdrawal={true}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const depositChip = screen.getByRole('button', { name: /deposit/i });
    fireEvent.click(depositChip);

    expect(mockOnWithdrawalToggle).toHaveBeenCalledWith(false);
  });

  it('calls onWithdrawalToggle when withdrawal chip is clicked', () => {
    render(
      <ContributionForm
        amount=""
        note=""
        isWithdrawal={false}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const withdrawalChip = screen.getByRole('button', { name: /withdrawal/i });
    fireEvent.click(withdrawalChip);

    expect(mockOnWithdrawalToggle).toHaveBeenCalledWith(true);
  });

  it('calls onAmountChange when amount input changes', () => {
    render(
      <ContributionForm
        amount=""
        note=""
        isWithdrawal={false}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '100' } });

    expect(mockOnAmountChange).toHaveBeenCalledWith('100');
  });

  it('calls onNoteChange when note input changes', () => {
    render(
      <ContributionForm
        amount=""
        note=""
        isWithdrawal={false}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const noteInput = screen.getByLabelText(/note/i);
    fireEvent.change(noteInput, { target: { value: 'Test note' } });

    expect(mockOnNoteChange).toHaveBeenCalledWith('Test note');
  });

  it('calls onSubmit when form is submitted', () => {
    render(
      <ContributionForm
        amount="50"
        note="Test note"
        isWithdrawal={false}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when submitting', () => {
    render(
      <ContributionForm
        amount="50"
        note=""
        isWithdrawal={false}
        submitting={true}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submitting/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays error message when error is present', () => {
    const errorMessage = 'Invalid amount';

    render(
      <ContributionForm
        amount=""
        note=""
        isWithdrawal={false}
        submitting={false}
        error={errorMessage}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('does not display error when error is null', () => {
    render(
      <ContributionForm
        amount=""
        note=""
        isWithdrawal={false}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const alerts = screen.queryByRole('alert');
    expect(alerts).not.toBeInTheDocument();
  });

  it('displays current values in input fields', () => {
    render(
      <ContributionForm
        amount="123.45"
        note="Monthly savings"
        isWithdrawal={false}
        submitting={false}
        error={null}
        onAmountChange={mockOnAmountChange}
        onNoteChange={mockOnNoteChange}
        onWithdrawalToggle={mockOnWithdrawalToggle}
        onSubmit={mockOnSubmit}
      />
    );

    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    const noteInput = screen.getByLabelText(/note/i) as HTMLInputElement;

    expect(amountInput.value).toBe('123.45');
    expect(noteInput.value).toBe('Monthly savings');
  });
});
