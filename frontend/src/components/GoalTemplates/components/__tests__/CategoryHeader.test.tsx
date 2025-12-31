import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryHeader from '../CategoryHeader';

describe('CategoryHeader', () => {
  it('renders category information', () => {
    const mockOnToggle = jest.fn();
    render(
      <CategoryHeader
        icon="💰"
        name="Savings"
        templateCount={5}
        isExpanded={false}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const mockOnToggle = jest.fn();
    render(
      <CategoryHeader
        icon="💰"
        name="Savings"
        templateCount={5}
        isExpanded={false}
        onToggle={mockOnToggle}
      />
    );

    await user.click(screen.getByRole('button'));

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
