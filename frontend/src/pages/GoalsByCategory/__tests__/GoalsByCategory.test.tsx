import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GoalsByCategory from '../GoalsByCategory';
import { AuthProvider } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { CategoryStats } from '../../../types/goal';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockCategories: CategoryStats[] = [
  {
    goal_type: 'savings',
    goal_count: 2,
    total_saved: 500,
    total_target: 2000,
    progress: 25,
    completed_count: 0,
    active_count: 2,
    goals: [
      {
        id: 1,
        title: 'Vacation Fund',
        description: 'Beach trip',
        target_amount: 1000,
        current_amount: 250,
        goal_type: 'savings',
        target_date: '2025-06-01',
        icon: null,
        color: null,
        progress_percentage: 25,
        remaining_amount: 750,
        completed: false,
        group_id: null,
        group_name: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Rainy Day Savings',
        description: 'Rainy day',
        target_amount: 1000,
        current_amount: 250,
        goal_type: 'savings',
        target_date: null,
        icon: null,
        color: null,
        progress_percentage: 25,
        remaining_amount: 750,
        completed: false,
        group_id: null,
        group_name: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ],
  },
  {
    goal_type: 'vacation',
    goal_count: 1,
    total_saved: 1000,
    total_target: 1000,
    progress: 100,
    completed_count: 1,
    active_count: 0,
    goals: [
      {
        id: 3,
        title: 'Hawaii Trip',
        description: 'Summer vacation',
        target_amount: 1000,
        current_amount: 1000,
        goal_type: 'vacation',
        target_date: '2025-08-01',
        icon: null,
        color: null,
        progress_percentage: 100,
        remaining_amount: 0,
        completed: true,
        group_id: null,
        group_name: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ],
  },
  {
    goal_type: 'emergency_fund',
    goal_count: 0,
    total_saved: 0,
    total_target: 0,
    progress: 0,
    completed_count: 0,
    active_count: 0,
    goals: [],
  },
  {
    goal_type: 'debt_payoff',
    goal_count: 0,
    total_saved: 0,
    total_target: 0,
    progress: 0,
    completed_count: 0,
    active_count: 0,
    goals: [],
  },
  {
    goal_type: 'retirement',
    goal_count: 0,
    total_saved: 0,
    total_target: 0,
    progress: 0,
    completed_count: 0,
    active_count: 0,
    goals: [],
  },
  {
    goal_type: 'home',
    goal_count: 0,
    total_saved: 0,
    total_target: 0,
    progress: 0,
    completed_count: 0,
    active_count: 0,
    goals: [],
  },
  {
    goal_type: 'education',
    goal_count: 0,
    total_saved: 0,
    total_target: 0,
    progress: 0,
    completed_count: 0,
    active_count: 0,
    goals: [],
  },
  {
    goal_type: 'vehicle',
    goal_count: 0,
    total_saved: 0,
    total_target: 0,
    progress: 0,
    completed_count: 0,
    active_count: 0,
    goals: [],
  },
  {
    goal_type: 'other',
    goal_count: 0,
    total_saved: 0,
    total_target: 0,
    progress: 0,
    completed_count: 0,
    active_count: 0,
    goals: [],
  },
];

const renderGoalsByCategory = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <GoalsByCategory />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('GoalsByCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    });

    it('shows login required message', async () => {
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText(/please log in to view your goals by category/i)).toBeInTheDocument();
      });
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
    });

    it('displays page title', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('Goals by Category')).toBeInTheDocument();
      });
    });

    it('shows overall progress stats', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('Overall Progress')).toBeInTheDocument();
      });
      expect(screen.getByText('$1,500')).toBeInTheDocument(); // Total saved
      expect(screen.getByText('$3,000')).toBeInTheDocument(); // Total target
    });

    it('displays categories with goal counts', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('Savings')).toBeInTheDocument();
      });
      expect(screen.getByText('2 goals')).toBeInTheDocument();
      expect(screen.getByText('1 goal')).toBeInTheDocument();
    });

    it('shows completed count chip for categories with completions', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('1 completed')).toBeInTheDocument();
      });
    });

    it('displays goals within expanded categories', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
      });
      expect(screen.getByText('Rainy Day Savings')).toBeInTheDocument();
      expect(screen.getByText('Hawaii Trip')).toBeInTheDocument();
    });

    it('navigates to goal detail when goal clicked', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Vacation Fund'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals/1');
    });

    it('navigates to list view when List View button clicked', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('List View')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('List View'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals');
    });

    it('navigates to new goal form when New Goal button clicked', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('New Goal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('New Goal'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals/new');
    });

    it('shows empty state when no goals', async () => {
      const emptyCategories = mockCategories.map(c => ({ ...c, goal_count: 0, goals: [] }));
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: emptyCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('No goals yet')).toBeInTheDocument();
      });
      expect(screen.getByText('Create Your First Goal')).toBeInTheDocument();
    });

    it('shows error message when API fails', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ error: 'Failed to load categories' });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('Failed to load categories')).toBeInTheDocument();
      });
    });

    it('shows categories with and without goals', async () => {
      mockedApi.getGoalsByCategory.mockResolvedValue({ data: { categories: mockCategories } });
      renderGoalsByCategory();

      await waitFor(() => {
        expect(screen.getByText('Savings')).toBeInTheDocument();
      });

      // Categories with goals have the goal count
      expect(screen.getByText('2 goals')).toBeInTheDocument();
      expect(screen.getByText('1 goal')).toBeInTheDocument();
    });
  });
});
