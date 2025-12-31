import { render, screen, fireEvent } from '@testing-library/react';
import DeleteGroupDialog from '../DeleteGroupDialog';

describe('DeleteGroupDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <DeleteGroupDialog
        open={true}
        groupName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Delete Group?')).toBeInTheDocument();
  });

  it('displays group name in confirmation message', () => {
    render(
      <DeleteGroupDialog
        open={true}
        groupName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/delete "Test Group"/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteGroupDialog
        open={true}
        groupName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <DeleteGroupDialog
        open={true}
        groupName="Test Group"
        submitting={false}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('disables delete button when submitting', () => {
    render(
      <DeleteGroupDialog
        open={true}
        groupName="Test Group"
        submitting={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });
});
