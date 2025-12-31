import { render, screen } from '@testing-library/react';
import RecentActivityList from '../RecentActivityList';
import { RecentContribution } from '../../../services/api';

describe('RecentActivityList', () => {
  const mockContribution: RecentContribution = {
    id: 1,
    amount: 100,
    note: 'Monthly savings',
    contributed_at: '2025-01-15T10:00:00Z',
    goal: {
      id: 1,
      title: 'Emergency Fund',
      goal_type: 'emergency_fund',
    },
  };

  describe('Empty State', () => {
    it('renders empty state message when no contributions', () => {
      render(<RecentActivityList contributions={[]} />);
      expect(screen.getByText(/no contributions yet/i)).toBeInTheDocument();
    });

    it('shows helper text in empty state', () => {
      render(<RecentActivityList contributions={[]} />);
      expect(screen.getByText(/add to a goal to see activity here/i)).toBeInTheDocument();
    });
  });

  describe('Contribution Display', () => {
    it('renders contribution with goal title', () => {
      render(<RecentActivityList contributions={[mockContribution]} />);
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });

    it('renders contribution amount', () => {
      render(<RecentActivityList contributions={[mockContribution]} />);
      expect(screen.getByText(/\+\$100/)).toBeInTheDocument();
    });

    it('renders contribution date', () => {
      render(<RecentActivityList contributions={[mockContribution]} />);
      // formatDateShort formats as MM/DD/YYYY
      expect(screen.getByText(/1\/15\/2025/)).toBeInTheDocument();
    });

    it('renders contribution note when present', () => {
      render(<RecentActivityList contributions={[mockContribution]} />);
      expect(screen.getByText(/monthly savings/i)).toBeInTheDocument();
    });

    it('does not render note separator when note is null', () => {
      const contributionWithoutNote = { ...mockContribution, note: null };
      render(<RecentActivityList contributions={[contributionWithoutNote]} />);
      const secondaryText = screen.getByText(/1\/15\/2025/);
      expect(secondaryText.textContent).not.toContain('—');
    });
  });

  describe('Positive Amounts', () => {
    it('displays positive amount with plus sign', () => {
      const positiveContribution = { ...mockContribution, amount: 250 };
      render(<RecentActivityList contributions={[positiveContribution]} />);
      expect(screen.getByText(/\+\$250/)).toBeInTheDocument();
    });

    it('displays zero amount with plus sign', () => {
      const zeroContribution = { ...mockContribution, amount: 0 };
      render(<RecentActivityList contributions={[zeroContribution]} />);
      expect(screen.getByText(/\+\$0/)).toBeInTheDocument();
    });

    it('formats decimal amounts correctly', () => {
      const decimalContribution = { ...mockContribution, amount: 123.45 };
      render(<RecentActivityList contributions={[decimalContribution]} />);
      expect(screen.getByText(/\+\$123\.45/)).toBeInTheDocument();
    });
  });

  describe('Negative Amounts (Withdrawals)', () => {
    it('displays negative amount without additional minus sign', () => {
      const negativeContribution = { ...mockContribution, amount: -50 };
      render(<RecentActivityList contributions={[negativeContribution]} />);
      expect(screen.getByText(/-\$50/)).toBeInTheDocument();
    });

    it('formats negative decimal amounts correctly', () => {
      const negativeDecimalContribution = { ...mockContribution, amount: -75.5 };
      render(<RecentActivityList contributions={[negativeDecimalContribution]} />);
      expect(screen.getByText(/-\$75\.5/)).toBeInTheDocument();
    });
  });

  describe('Multiple Contributions', () => {
    it('renders multiple contributions in a list', () => {
      const contributions: RecentContribution[] = [
        {
          id: 1,
          amount: 100,
          note: 'First contribution',
          contributed_at: '2025-01-15T10:00:00Z',
          goal: { id: 1, title: 'Emergency Fund', goal_type: 'emergency_fund' },
        },
        {
          id: 2,
          amount: 200,
          note: 'Second contribution',
          contributed_at: '2025-01-16T10:00:00Z',
          goal: { id: 2, title: 'Vacation Fund', goal_type: 'vacation' },
        },
        {
          id: 3,
          amount: -50,
          note: 'Withdrawal',
          contributed_at: '2025-01-17T10:00:00Z',
          goal: { id: 1, title: 'Emergency Fund', goal_type: 'emergency_fund' },
        },
      ];

      render(<RecentActivityList contributions={contributions} />);

      expect(screen.getAllByText('Emergency Fund').length).toBe(2);
      expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
      expect(screen.getByText(/\+\$100/)).toBeInTheDocument();
      expect(screen.getByText(/\+\$200/)).toBeInTheDocument();
      expect(screen.getByText(/-\$50/)).toBeInTheDocument();
      expect(screen.getByText(/first contribution/i)).toBeInTheDocument();
      expect(screen.getByText(/second contribution/i)).toBeInTheDocument();
      expect(screen.getByText(/withdrawal/i)).toBeInTheDocument();
    });

    it('renders contributions with mixed notes', () => {
      const contributions: RecentContribution[] = [
        {
          id: 1,
          amount: 100,
          note: 'With note',
          contributed_at: '2025-01-15T10:00:00Z',
          goal: { id: 1, title: 'Goal 1', goal_type: 'savings' },
        },
        {
          id: 2,
          amount: 200,
          note: null,
          contributed_at: '2025-01-16T10:00:00Z',
          goal: { id: 2, title: 'Goal 2', goal_type: 'savings' },
        },
      ];

      render(<RecentActivityList contributions={contributions} />);

      expect(screen.getByText('Goal 1')).toBeInTheDocument();
      expect(screen.getByText('Goal 2')).toBeInTheDocument();
      expect(screen.getByText(/with note/i)).toBeInTheDocument();
    });
  });

  describe('Different Goal Types', () => {
    it('displays contributions for different goal types', () => {
      const contributions: RecentContribution[] = [
        {
          id: 1,
          amount: 100,
          note: null,
          contributed_at: '2025-01-15T10:00:00Z',
          goal: { id: 1, title: 'Emergency', goal_type: 'emergency_fund' },
        },
        {
          id: 2,
          amount: 200,
          note: null,
          contributed_at: '2025-01-16T10:00:00Z',
          goal: { id: 2, title: 'Vacation', goal_type: 'vacation' },
        },
        {
          id: 3,
          amount: 300,
          note: null,
          contributed_at: '2025-01-17T10:00:00Z',
          goal: { id: 3, title: 'Home', goal_type: 'home' },
        },
      ];

      render(<RecentActivityList contributions={contributions} />);

      expect(screen.getByText('Emergency')).toBeInTheDocument();
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('Large Amounts', () => {
    it('formats large amounts correctly', () => {
      const largeContribution = { ...mockContribution, amount: 5000 };
      render(<RecentActivityList contributions={[largeContribution]} />);
      expect(screen.getByText(/\+\$5,000/)).toBeInTheDocument();
    });

    it('formats very large amounts correctly', () => {
      const veryLargeContribution = { ...mockContribution, amount: 1234567.89 };
      render(<RecentActivityList contributions={[veryLargeContribution]} />);
      expect(screen.getByText(/\+\$1,234,567\.89/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very small decimal amounts', () => {
      const smallContribution = { ...mockContribution, amount: 0.01 };
      render(<RecentActivityList contributions={[smallContribution]} />);
      expect(screen.getByText(/\+\$0\.01/)).toBeInTheDocument();
    });

    it('handles contributions to same goal', () => {
      const contributions: RecentContribution[] = [
        {
          id: 1,
          amount: 100,
          note: 'First',
          contributed_at: '2025-01-15T10:00:00Z',
          goal: { id: 1, title: 'Emergency Fund', goal_type: 'emergency_fund' },
        },
        {
          id: 2,
          amount: 200,
          note: 'Second',
          contributed_at: '2025-01-16T10:00:00Z',
          goal: { id: 1, title: 'Emergency Fund', goal_type: 'emergency_fund' },
        },
      ];

      render(<RecentActivityList contributions={contributions} />);

      const goalTitles = screen.getAllByText('Emergency Fund');
      expect(goalTitles).toHaveLength(2);
    });

    it('handles empty note string as falsy', () => {
      const emptyNoteContribution = { ...mockContribution, note: '' };
      render(<RecentActivityList contributions={[emptyNoteContribution]} />);
      // Empty string is falsy in JS, so separator should not appear
      const secondaryText = screen.getByText(/1\/15\/2025/);
      expect(secondaryText.textContent).not.toContain('—');
    });
  });
});
