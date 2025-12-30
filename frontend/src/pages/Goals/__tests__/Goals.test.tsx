import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Goals from '../Goals';
import { AuthProvider } from '../../../contexts/AuthContext';
import { GoalsProvider } from '../../../contexts/GoalsContext';
import { api } from '../../../services/api';
import { Goal } from '../../../types/goal';

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
  description: 'Save for a beach trip',
  target_amount: 1000,
  current_amount: 250,
  goal_type: 'savings',
  target_date: '2025-06-01',
  icon: 'beach',
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
  id: 2,
  title: 'Emergency Fund',
  current_amount: 1000,
  progress_percentage: 100,
  remaining_amount: 0,
  completed: true,
};

const groupGoal: Goal = {
  ...mockGoal,
  id: 3,
  title: 'Family Vacation',
  group_id: 1,
  group_name: 'Family',
};

const renderGoals = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <GoalsProvider>
          <Goals />
        </GoalsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Goals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
  });

  describe('empty state', () => {
    it('shows empty state when no goals', async () => {
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText('No goals yet')).toBeInTheDocument();
      });
      expect(screen.getByText(/start tracking your financial goals/i)).toBeInTheDocument();
    });

    it('shows guest message in empty state when not logged in', async () => {
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText(/saved in your browser/i)).toBeInTheDocument();
      });
    });

    it('navigates to new goal form when create button clicked', async () => {
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText('Create Your First Goal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Create Your First Goal'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals/new');
    });
  });

  describe('goals list with logged in user', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
    });

    it('displays goals', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
      });
      expect(screen.getByText('Save for a beach trip')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('displays goal with group name chip', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [groupGoal] } });
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText('Family')).toBeInTheDocument();
      });
    });

    it('shows completed goal message', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [completedGoal] } });
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText('Goal reached!')).toBeInTheDocument();
      });
    });

    it('shows remaining amount for incomplete goals', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText('$750 to go')).toBeInTheDocument();
      });
    });

    it('shows target date when present', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText(/target:/i)).toBeInTheDocument();
      });
    });

    it('shows New Goal button when goals exist', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText('New Goal')).toBeInTheDocument();
      });
    });

    it('navigates to goal detail when card clicked', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      renderGoals();

      await waitFor(() => {
        expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Vacation Fund'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals/1');
    });

    it('navigates to edit form when edit button clicked', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      renderGoals();

      await waitFor(() => {
        expect(screen.getByLabelText('edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('edit'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals/1/edit');
    });

    it('confirms before deleting goal', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      mockedApi.deleteGoal.mockResolvedValue({ data: { success: true } });
      window.confirm = jest.fn(() => false);
      renderGoals();

      await waitFor(() => {
        expect(screen.getByLabelText('delete')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('delete'));
      expect(window.confirm).toHaveBeenCalledWith('Delete "Vacation Fund"? This cannot be undone.');
    });

    it('deletes goal when confirmed', async () => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
      mockedApi.deleteGoal.mockResolvedValue({ data: { success: true } });
      window.confirm = jest.fn(() => true);
      renderGoals();

      await waitFor(() => {
        expect(screen.getByLabelText('delete')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('delete'));

      await waitFor(() => {
        expect(mockedApi.deleteGoal).toHaveBeenCalledWith(1);
      });
    });
  });
});
