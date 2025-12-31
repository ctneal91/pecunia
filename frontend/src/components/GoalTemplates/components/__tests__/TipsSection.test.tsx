import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TipsSection from '../TipsSection';

describe('TipsSection', () => {
  const mockTips = ['Tip 1', 'Tip 2', 'Tip 3'];

  it('renders show tips button when tips are provided', () => {
    render(<TipsSection tips={mockTips} />);

    expect(screen.getByRole('button', { name: /show tips/i })).toBeInTheDocument();
  });

  it('does not render when tips array is empty', () => {
    const { container } = render(<TipsSection tips={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('shows tips when button is clicked', async () => {
    const user = userEvent.setup();
    render(<TipsSection tips={mockTips} />);

    await user.click(screen.getByRole('button', { name: /show tips/i }));

    expect(screen.getByText('Tip 1')).toBeInTheDocument();
    expect(screen.getByText('Tip 2')).toBeInTheDocument();
    expect(screen.getByText('Tip 3')).toBeInTheDocument();
  });

  it('hides tips when hide button is clicked', async () => {
    const user = userEvent.setup();
    render(<TipsSection tips={mockTips} />);

    // Show tips
    await user.click(screen.getByRole('button', { name: /show tips/i }));
    expect(screen.getByText('Tip 1')).toBeInTheDocument();

    // Hide tips
    await user.click(screen.getByRole('button', { name: /hide tips/i }));

    // Tips should still be in DOM but hidden
    expect(screen.getByRole('button', { name: /show tips/i })).toBeInTheDocument();
  });
});
