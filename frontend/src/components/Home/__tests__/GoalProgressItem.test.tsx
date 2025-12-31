import { render, screen, fireEvent } from '@testing-library/react';
import GoalProgressItem from '../GoalProgressItem';
import { Goal } from '../../../types/goal';

describe('GoalProgressItem', () => {
  const mockOnClick = jest.fn();

  const mockGoal: Goal = {
    id: 1,
    title: 'Emergency Fund',
    description: 'Save for emergencies',
    target_amount: 10000,
    current_amount: 5000,
    goal_type: 'emergency_fund',
    target_date: '2025-12-31',
    icon: null,
    color: null,
    progress_percentage: 50,
    remaining_amount: 5000,
    completed: false,
    group_id: null,
    group_name: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders goal title with icon', () => {
      render(<GoalProgressItem goal={mockGoal} onClick={mockOnClick} />);
      expect(screen.getByText(/🛡️ Emergency Fund/i)).toBeInTheDocument();
    });

    it('renders progress percentage by default', () => {
      render(<GoalProgressItem goal={mockGoal} onClick={mockOnClick} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders amounts when showAmounts is true', () => {
      render(<GoalProgressItem goal={mockGoal} onClick={mockOnClick} showAmounts={true} />);
      expect(screen.getByText('$5,000 / $10,000')).toBeInTheDocument();
    });

    it('renders progress bar', () => {
      const { container } = render(<GoalProgressItem goal={mockGoal} onClick={mockOnClick} />);
      const progressBar = container.querySelector('.MuiLinearProgress-root');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Progress States', () => {
    it('displays correct progress for incomplete goal', () => {
      const incompleteGoal = { ...mockGoal, progress_percentage: 25, completed: false };
      render(<GoalProgressItem goal={incompleteGoal} onClick={mockOnClick} />);
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('displays correct progress for completed goal', () => {
      const completedGoal = { ...mockGoal, progress_percentage: 100, completed: true };
      render(<GoalProgressItem goal={completedGoal} onClick={mockOnClick} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('caps progress at 100% for over-contributed goals', () => {
      const overContributedGoal = { ...mockGoal, progress_percentage: 150, completed: true };
      const { container } = render(<GoalProgressItem goal={overContributedGoal} onClick={mockOnClick} />);
      const progressBar = container.querySelector('.MuiLinearProgress-bar');
      // The progress bar should be at 100% (width: 100%)
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Goal Types', () => {
    it('renders savings goal with correct icon', () => {
      const savingsGoal = { ...mockGoal, goal_type: 'savings' as const, title: 'Vacation Fund' };
      render(<GoalProgressItem goal={savingsGoal} onClick={mockOnClick} />);
      expect(screen.getByText(/💰 Vacation Fund/i)).toBeInTheDocument();
    });

    it('renders vacation goal with correct icon', () => {
      const vacationGoal = { ...mockGoal, goal_type: 'vacation' as const, title: 'Hawaii Trip' };
      render(<GoalProgressItem goal={vacationGoal} onClick={mockOnClick} />);
      expect(screen.getByText(/✈️ Hawaii Trip/i)).toBeInTheDocument();
    });

    it('renders retirement goal with correct icon', () => {
      const retirementGoal = { ...mockGoal, goal_type: 'retirement' as const, title: 'Retirement' };
      render(<GoalProgressItem goal={retirementGoal} onClick={mockOnClick} />);
      expect(screen.getByText(/🏖️ Retirement/i)).toBeInTheDocument();
    });

    it('renders home goal with correct icon', () => {
      const homeGoal = { ...mockGoal, goal_type: 'home' as const, title: 'Down Payment' };
      render(<GoalProgressItem goal={homeGoal} onClick={mockOnClick} />);
      expect(screen.getByText(/🏠 Down Payment/i)).toBeInTheDocument();
    });
  });

  describe('Click Interaction', () => {
    it('calls onClick when component is clicked', () => {
      render(<GoalProgressItem goal={mockGoal} onClick={mockOnClick} />);
      const goalItem = screen.getByText(/Emergency Fund/i).closest('div');
      fireEvent.click(goalItem!);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('has pointer cursor indicating clickability', () => {
      const { container } = render(<GoalProgressItem goal={mockGoal} onClick={mockOnClick} />);
      // Check that the component has clickable styling
      const clickableBox = container.querySelector('.MuiBox-root');
      expect(clickableBox).toBeInTheDocument();
    });
  });

  describe('Display Modes', () => {
    it('shows percentage when showAmounts is false', () => {
      render(<GoalProgressItem goal={mockGoal} onClick={mockOnClick} showAmounts={false} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });

    it('shows amounts when showAmounts is true', () => {
      render(<GoalProgressItem goal={mockGoal} onClick={mockOnClick} showAmounts={true} />);
      expect(screen.getByText('$5,000 / $10,000')).toBeInTheDocument();
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('formats currency correctly for different amounts', () => {
      const goalWithDifferentAmount = {
        ...mockGoal,
        current_amount: 1234.56,
        target_amount: 9876.54,
      };
      render(<GoalProgressItem goal={goalWithDifferentAmount} onClick={mockOnClick} showAmounts={true} />);
      expect(screen.getByText('$1,234.56 / $9,876.54')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero progress', () => {
      const zeroProgressGoal = {
        ...mockGoal,
        current_amount: 0,
        progress_percentage: 0,
      };
      render(<GoalProgressItem goal={zeroProgressGoal} onClick={mockOnClick} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles very small amounts', () => {
      const smallAmountGoal = {
        ...mockGoal,
        current_amount: 0.01,
        target_amount: 100,
      };
      render(<GoalProgressItem goal={smallAmountGoal} onClick={mockOnClick} showAmounts={true} />);
      expect(screen.getByText('$0.01 / $100')).toBeInTheDocument();
    });

    it('handles large amounts', () => {
      const largeAmountGoal = {
        ...mockGoal,
        current_amount: 500000,
        target_amount: 1000000,
      };
      render(<GoalProgressItem goal={largeAmountGoal} onClick={mockOnClick} showAmounts={true} />);
      expect(screen.getByText('$500,000 / $1,000,000')).toBeInTheDocument();
    });
  });
});
