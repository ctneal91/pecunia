import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GoalDetail from '../GoalDetail';
import { AuthProvider } from '../../../contexts/AuthContext';
import { GoalsProvider } from '../../../contexts/GoalsContext';
import { api } from '../../../services/api';
import { Goal, Contribution } from '../../../types/goal';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockGoal: Goal = {
  id: 1,
  title: 'Vacation Fund',
  description: 'Beach trip savings',
  target_amount: 1000,
  current_amount: 250,
  goal_type: 'savings',
  target_date: '2025-06-01',
  icon: null,
  color: '#3498db',
  progress_percentage: 25,
  remaining_amount: 750,
  completed: false,
  group_id: null,
  group_name: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const completedGoal: Goal = {
  ...mockGoal,
  current_amount: 1000,
  progress_percentage: 100,
  remaining_amount: 0,
  completed: true,
};

const mockContribution: Contribution = {
  id: 1,
  goal_id: 1,
  user_id: 1,
  amount: 100,
  note: 'Weekly deposit',
  contributed_at: '2025-01-15T00:00:00Z',
  created_at: '2025-01-15T00:00:00Z',
};

const mockGroupGoal: Goal = {
  ...mockGoal,
  id: 2,
  title: 'Family Vacation',
  group_id: 1,
  group_name: 'Smith Family',
  current_amount: 500,
  contributors: [
    { user_id: 1, user_name: 'John Smith', total_amount: 300, contribution_count: 3, percentage: 60 },
    { user_id: 2, user_name: 'Jane Smith', total_amount: 200, contribution_count: 2, percentage: 40 },
  ],
  contributor_count: 2,
};

const renderGoalDetail = (id: string = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/goals/${id}`]}>
      <AuthProvider>
        <GoalsProvider>
          <Routes>
            <Route path="/goals/:id" element={<GoalDetail />} />
          </Routes>
        </GoalsProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('GoalDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedApi.getContributions.mockResolvedValue({ data: { contributions: [] } });
    mockedApi.getRecurringContributions.mockResolvedValue({ data: { recurring_contributions: [] } });
  });

  describe('when goal not found', () => {
    it('shows error message', async () => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      renderGoalDetail('999');

      await waitFor(() => {
        expect(screen.getByText('Goal not found')).toBeInTheDocument();
      });
      expect(screen.getByText('Back to Goals')).toBeInTheDocument();
    });
  });

  describe('goal display with logged in user', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      mockedApi.getGoal.mockResolvedValue({ data: { goal: mockGoal } });
    });

    it('shows goal title and description', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
      });
      expect(screen.getByText('Beach trip savings')).toBeInTheDocument();
    });

    it('shows progress information', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('25% complete')).toBeInTheDocument();
      });
      expect(screen.getByText('$750 to go')).toBeInTheDocument();
    });

    it('shows goal reached for completed goals', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [completedGoal] } });
      mockedApi.getGoal.mockResolvedValue({ data: { goal: completedGoal } });
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Goal reached!')).toBeInTheDocument();
      });
    });

    it('shows target date when present', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText(/target date:/i)).toBeInTheDocument();
      });
    });

    it('navigates to edit when edit button clicked', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals/1/edit');
    });

    it('navigates back when back button clicked', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Back to Goals')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Back to Goals'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals');
    });

    it('shows contribution form', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Add Contribution')).toBeInTheDocument();
      });
      expect(screen.getByText('Deposit')).toBeInTheDocument();
      expect(screen.getByText('Withdrawal')).toBeInTheDocument();
    });

    it('shows contribution history', async () => {
      mockedApi.getContributions.mockResolvedValue({
        data: { contributions: [mockContribution] }
      });
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Contribution History')).toBeInTheDocument();
      });
      expect(screen.getByText('+$100')).toBeInTheDocument();
    });
  });

  describe('guest mode', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    });

    it('shows guest mode message', async () => {
      // Store a goal in localStorage for guest mode
      localStorage.setItem('pecunia_guest_goals', JSON.stringify([mockGoal]));
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText(/sign up to track your contribution history/i)).toBeInTheDocument();
      });
    });
  });

  describe('group goal with contributors', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGroupGoal] } });
      mockedApi.getGoal.mockResolvedValue({ data: { goal: mockGroupGoal } });
      mockedApi.getContributions.mockResolvedValue({ data: { contributions: [] } });
    });

    it('shows shared goal indicator', async () => {
      renderGoalDetail('2');

      await waitFor(() => {
        expect(screen.getByText(/shared goal in smith family/i)).toBeInTheDocument();
      });
    });

    it('shows contributors section with count', async () => {
      renderGoalDetail('2');

      await waitFor(() => {
        expect(screen.getByText('Contributors (2)')).toBeInTheDocument();
      });
    });

    it('displays contributor names', async () => {
      renderGoalDetail('2');

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shows contributor amounts and percentages', async () => {
      renderGoalDetail('2');

      await waitFor(() => {
        expect(screen.getByText('$300')).toBeInTheDocument();
      });
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('$200')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('shows contribution counts', async () => {
      renderGoalDetail('2');

      await waitFor(() => {
        expect(screen.getByText('3 contributions')).toBeInTheDocument();
      });
      expect(screen.getByText('2 contributions')).toBeInTheDocument();
    });
  });

  describe('personal goal without contributors', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      mockedApi.getGoal.mockResolvedValue({ data: { goal: mockGoal } });
    });

    it('does not show contributors section for personal goals', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
      });
      expect(screen.queryByText(/contributors/i)).not.toBeInTheDocument();
    });

    it('does not show shared goal indicator for personal goals', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
      });
      expect(screen.queryByText(/shared goal in/i)).not.toBeInTheDocument();
    });
  });

  describe('milestone progress display', () => {
    const goalWithMilestones: Goal = {
      ...mockGoal,
      milestones: [
        { percentage: 25, achieved_at: '2025-01-15T00:00:00Z' },
      ],
    };

    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [goalWithMilestones] } });
      mockedApi.getGoal.mockResolvedValue({ data: { goal: goalWithMilestones } });
      mockedApi.getContributions.mockResolvedValue({ data: { contributions: [] } });
    });

    it('shows milestone progress section for logged in users', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Milestones')).toBeInTheDocument();
      });
    });

    it('shows achieved milestones with check icons', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Milestones')).toBeInTheDocument();
      });
      const checkIcons = screen.getAllByTestId('CheckCircleIcon');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('contribution actions', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      mockedApi.getGoal.mockResolvedValue({ data: { goal: mockGoal } });
      mockedApi.getContributions.mockResolvedValue({
        data: { contributions: [mockContribution] }
      });
    });

    it('deletes contribution when delete button clicked and confirmed', async () => {
      window.confirm = jest.fn(() => true);
      mockedApi.deleteContribution.mockResolvedValue({ data: { goal: mockGoal } });

      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Contribution History')).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText('delete');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockedApi.deleteContribution).toHaveBeenCalledWith(1, 1);
      });
    });

    it('does not delete contribution when delete is cancelled', async () => {
      window.confirm = jest.fn(() => false);

      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Contribution History')).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText('delete');
      fireEvent.click(deleteButton);

      expect(mockedApi.deleteContribution).not.toHaveBeenCalled();
    });
  });

  describe('recurring contributions', () => {
    const mockRecurring = {
      id: 1,
      goal_id: 1,
      user_id: 1,
      amount: 50,
      frequency: 'weekly' as const,
      is_active: true,
      next_occurrence_at: '2025-01-22',
      end_date: null,
      note: null,
      created_at: '2025-01-01T00:00:00Z',
    };

    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      mockedApi.getGoal.mockResolvedValue({ data: { goal: mockGoal } });
      mockedApi.getRecurringContributions.mockResolvedValue({
        data: { recurring_contributions: [mockRecurring] }
      });
    });

    it('displays recurring contributions section', async () => {
      renderGoalDetail();

      await waitFor(() => {
        expect(screen.getByText('Recurring Contributions')).toBeInTheDocument();
      });
    });
  });
});
