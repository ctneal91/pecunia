import { render, screen, fireEvent } from '@testing-library/react';
import EditGroupDialog from '../EditGroupDialog';

describe('EditGroupDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnNameChange = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <EditGroupDialog
        open={true}
        editName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onNameChange={mockOnNameChange}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Edit Group')).toBeInTheDocument();
  });

  it('does not render dialog when closed', () => {
    render(
      <EditGroupDialog
        open={false}
        editName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onNameChange={mockOnNameChange}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('Edit Group')).not.toBeInTheDocument();
  });

  it('displays edit name in input field', () => {
    render(
      <EditGroupDialog
        open={true}
        editName="New Name"
        submitting={false}
        onClose={mockOnClose}
        onNameChange={mockOnNameChange}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText(/group name/i) as HTMLInputElement;
    expect(input.value).toBe('New Name');
  });

  it('calls onNameChange when input changes', () => {
    render(
      <EditGroupDialog
        open={true}
        editName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onNameChange={mockOnNameChange}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByLabelText(/group name/i);
    fireEvent.change(input, { target: { value: 'Updated Name' } });

    expect(mockOnNameChange).toHaveBeenCalledWith('Updated Name');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <EditGroupDialog
        open={true}
        editName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onNameChange={mockOnNameChange}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when save button is clicked', () => {
    render(
      <EditGroupDialog
        open={true}
        editName="New Name"
        submitting={false}
        onClose={mockOnClose}
        onNameChange={mockOnNameChange}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('disables save button when submitting', () => {
    render(
      <EditGroupDialog
        open={true}
        editName="New Name"
        submitting={true}
        onClose={mockOnClose}
        onNameChange={mockOnNameChange}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('disables save button when name is empty', () => {
    render(
      <EditGroupDialog
        open={true}
        editName="   "
        submitting={false}
        onClose={mockOnClose}
        onNameChange={mockOnNameChange}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });
});
