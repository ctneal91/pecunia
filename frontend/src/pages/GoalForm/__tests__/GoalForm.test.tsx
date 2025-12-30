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

// Helper to skip to form step in create mode
const skipToFormStep = async () => {
  await waitFor(() => {
    expect(screen.getByText(/skip - create custom goal/i)).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText(/skip - create custom goal/i));
  await waitFor(() => {
    expect(screen.getByLabelText(/goal title/i)).toBeInTheDocument();
  });
};

describe('GoalForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
  });

  describe('template selection step', () => {
    it('shows template selection on create', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Choose Template')).toBeInTheDocument();
        expect(screen.getByText('Customize Goal')).toBeInTheDocument();
      });
    });

    it('shows template categories', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        expect(screen.getByText('Travel & Vacation')).toBeInTheDocument();
      });
    });

    it('allows skipping to custom goal', async () => {
      renderGoalForm();

      await skipToFormStep();

      expect(screen.getByLabelText(/goal title/i)).toBeInTheDocument();
    });

    it('pre-fills form when template selected', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
      });

      // Expand category and select template
      const categoryButton = screen.getByText('Emergency Fund').closest('button');
      fireEvent.click(categoryButton!);

      await waitFor(() => {
        expect(screen.getByText('Starter Emergency Fund')).toBeInTheDocument();
      });

      const templateCard = screen.getByText('Starter Emergency Fund').closest('div[class*="MuiPaper"]');
      fireEvent.click(templateCard!);

      // Continue to form
      fireEvent.click(screen.getByText('Continue with Template'));

      await waitFor(() => {
        expect(screen.getByLabelText(/goal title/i)).toHaveValue('Starter Emergency Fund');
      });
    });
  });

  describe('create mode (guest)', () => {
    it('shows create form title', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Create New Goal')).toBeInTheDocument();
      });
    });

    it('shows create button after skipping templates', async () => {
      renderGoalForm();
      await skipToFormStep();

      expect(screen.getByText('Create Goal')).toBeInTheDocument();
    });

    it('validates required title', async () => {
      renderGoalForm();
      await skipToFormStep();

      const targetInput = screen.getByLabelText(/target amount/i);
      fireEvent.change(targetInput, { target: { value: '1000' } });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('validates target amount', async () => {
      renderGoalForm();
      await skipToFormStep();

      const titleInput = screen.getByLabelText(/goal title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Goal' } });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByText('Target amount must be greater than 0')).toBeInTheDocument();
      });
    });

    it('navigates back when cancel clicked on template step', async () => {
      renderGoalForm();

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockNavigate).toHaveBeenCalledWith('/goals');
    });

    it('creates goal and navigates', async () => {
      renderGoalForm();
      await skipToFormStep();

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

    it('shows edit form title without template step', async () => {
      renderGoalForm('1');

      await waitFor(() => {
        expect(screen.getByText('Edit Goal')).toBeInTheDocument();
      });
      // Should not show template step
      expect(screen.queryByText('Choose Template')).not.toBeInTheDocument();
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

    it('shows group selection after skipping to form', async () => {
      renderGoalForm();
      await skipToFormStep();

      await waitFor(() => {
        expect(screen.getByLabelText(/share with group/i)).toBeInTheDocument();
      });
    });
  });
});
