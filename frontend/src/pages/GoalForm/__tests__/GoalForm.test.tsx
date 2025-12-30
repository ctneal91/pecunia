import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GoalForm from '../GoalForm';
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
  description: 'Beach trip',
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

const renderGoalForm = (id?: string) => {
  const path = id ? `/goals/${id}/edit` : '/goals/new';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <GoalsProvider>
          <Routes>
            <Route path="/goals/new" element={<GoalForm />} />
            <Route path="/goals/:id/edit" element={<GoalForm />} />
          </Routes>
        </GoalsProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('GoalForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
  });

  describe('create mode (guest)', () => {
    it('shows create form title', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Create New Goal')).toBeInTheDocument();
      });
    });

    it('shows create button', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Create Goal')).toBeInTheDocument();
      });
    });

    it('validates required title', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Create Goal')).toBeInTheDocument();
      });

      const targetInput = screen.getByLabelText(/target amount/i);
      fireEvent.change(targetInput, { target: { value: '1000' } });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('validates target amount', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Create Goal')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/goal title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Goal' } });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByText('Target amount must be greater than 0')).toBeInTheDocument();
      });
    });

    it('navigates back when cancel clicked', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals');
    });

    it('creates goal and navigates', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Create Goal')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/goal title/i);
      fireEvent.change(titleInput, { target: { value: 'New Goal' } });

      const targetInput = screen.getByLabelText(/target amount/i);
      fireEvent.change(targetInput, { target: { value: '1000' } });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/goals');
      });
    });
  });

  describe('edit mode with logged in user', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
    });

    it('shows edit form title', async () => {
      renderGoalForm('1');

      await waitFor(() => {
        expect(screen.getByText('Edit Goal')).toBeInTheDocument();
      });
    });

    it('populates form with existing goal data', async () => {
      renderGoalForm('1');

      await waitFor(() => {
        expect(screen.getByLabelText(/goal title/i)).toHaveValue('Vacation Fund');
      });
    });

    it('shows update button', async () => {
      renderGoalForm('1');

      await waitFor(() => {
        expect(screen.getByText('Update Goal')).toBeInTheDocument();
      });
    });
  });

  describe('with groups', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [] } });
      mockedApi.getGroups.mockResolvedValue({
        data: { groups: [{ id: 1, name: 'Family', invite_code: 'ABC', member_count: 2, goal_count: 0, is_admin: true, created_at: '', updated_at: '' }] }
      });
    });

    it('shows group selection when logged in with groups', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByLabelText(/share with group/i)).toBeInTheDocument();
      });
    });
  });
});
