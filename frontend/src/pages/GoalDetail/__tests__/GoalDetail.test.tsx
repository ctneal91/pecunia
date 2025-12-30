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
});
