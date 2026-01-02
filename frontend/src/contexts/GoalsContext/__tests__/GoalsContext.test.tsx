import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalsProvider, useGoals } from '../GoalsContext';
import { AuthProvider } from '../../AuthContext';
import { api } from '../../../services/api';
import { goalStorage } from '../../../services/goalStorage';
import { Goal, GoalInput } from '../../../types/goal';

jest.mock('../../../services/api');
jest.mock('../../../services/goalStorage');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGoalStorage = goalStorage as jest.Mocked<typeof goalStorage>;

const mockGoal: Goal = {
  id: 1,
  title: 'Emergency Fund',
  description: 'Save for emergencies',
  target_amount: 10000,
  current_amount: 2500,
  goal_type: 'emergency_fund',
  target_date: '2025-12-31',
  icon: null,
  color: '#4CAF50',
  progress_percentage: 25,
  remaining_amount: 7500,
  completed: false,
  group_id: null,
  group_name: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const mockGoalInput: GoalInput = {
  title: 'Vacation Fund',
  target_amount: 5000,
  goal_type: 'vacation',
};

function TestComponent({ onAction }: { onAction?: (action: string, result: unknown) => void }) {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal, refreshGoals } = useGoals();

  if (loading) return <div>Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;

  return (
    <div>
      <div data-testid="goals-count">{goals.length}</div>
      <ul>
        {goals.map((goal) => (
          <li key={goal.id} data-testid={`goal-${goal.id}`}>
            {goal.title}
          </li>
        ))}
      </ul>
      <button
        onClick={async () => {
          const result = await createGoal(mockGoalInput);
          onAction?.('create', result);
        }}
      >
        Create Goal
      </button>
      <button
        onClick={async () => {
          const result = await updateGoal(1, { title: 'Updated Title' });
          onAction?.('update', result);
        }}
      >
        Update Goal
      </button>
      <button
        onClick={async () => {
          const result = await deleteGoal(1);
          onAction?.('delete', result);
        }}
      >
        Delete Goal
      </button>
      <button onClick={() => refreshGoals()}>Refresh</button>
    </div>
  );
}

function renderWithAuth(isAuthenticated: boolean) {
  if (isAuthenticated) {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } },
    });
  } else {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
  }

  return render(
    <AuthProvider>
      <GoalsProvider>
        <TestComponent />
      </GoalsProvider>
    </AuthProvider>
  );
}

function renderWithAuthAndCallback(isAuthenticated: boolean, onAction: (action: string, result: unknown) => void) {
  if (isAuthenticated) {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } },
    });
  } else {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
  }

  return render(
    <AuthProvider>
      <GoalsProvider>
        <TestComponent onAction={onAction} />
      </GoalsProvider>
    </AuthProvider>
  );
}

describe('GoalsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGoalStorage.getAll.mockReturnValue([]);
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal] } });
    });

    it('loads goals and shows them', async () => {
      renderWithAuth(true);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Emergency Fund');
      });
    });

    it('shows error when API fails', async () => {
      mockedApi.getGoals.mockResolvedValue({ error: 'Failed to load goals' });
      renderWithAuth(true);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load goals');
      });
    });

    it('handles API response with no goals property (line 35)', async () => {
      // @ts-expect-error Testing edge case where data exists but goals is undefined
      mockedApi.getGoals.mockResolvedValue({ data: {} });
      renderWithAuth(true);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('0');
      });
    });

    it('handles API response with undefined data (line 35)', async () => {
      mockedApi.getGoals.mockResolvedValue({});
      renderWithAuth(true);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('0');
      });
    });

    it('creates goal via API', async () => {
      const user = userEvent.setup();
      const newGoal: Goal = {
        ...mockGoal,
        id: 2,
        title: 'Vacation Fund',
        goal_type: 'vacation',
      };
      mockedApi.createGoal.mockResolvedValue({ data: { goal: newGoal } });

      const onAction = jest.fn();
      renderWithAuthAndCallback(true, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('2');
      });
      expect(onAction).toHaveBeenCalledWith('create', newGoal);
    });

    it('handles create goal error', async () => {
      const user = userEvent.setup();
      mockedApi.createGoal.mockResolvedValue({ error: 'Failed to create' });

      const onAction = jest.fn();
      renderWithAuthAndCallback(true, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(onAction).toHaveBeenCalledWith('create', null);
      });
    });

    it('updates goal via API', async () => {
      const user = userEvent.setup();
      const updatedGoal: Goal = { ...mockGoal, title: 'Updated Title' };
      mockedApi.updateGoal.mockResolvedValue({ data: { goal: updatedGoal } });

      const onAction = jest.fn();
      renderWithAuthAndCallback(true, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Emergency Fund');
      });

      await user.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Updated Title');
      });
      expect(onAction).toHaveBeenCalledWith('update', updatedGoal);
    });

    it('updates goal with multiple goals in list (line 73)', async () => {
      const goal2: Goal = { ...mockGoal, id: 2, title: 'Second Goal' };
      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal, goal2] } });

      const user = userEvent.setup();
      const updatedGoal: Goal = { ...mockGoal, title: 'Updated Title' };
      mockedApi.updateGoal.mockResolvedValue({ data: { goal: updatedGoal } });

      const onAction = jest.fn();
      renderWithAuthAndCallback(true, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('2');
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Emergency Fund');
        expect(screen.getByTestId('goal-2')).toHaveTextContent('Second Goal');
      });

      await user.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Updated Title');
        expect(screen.getByTestId('goal-2')).toHaveTextContent('Second Goal');
      });
    });

    it('handles update goal error', async () => {
      const user = userEvent.setup();
      mockedApi.updateGoal.mockResolvedValue({ error: 'Failed to update' });

      const onAction = jest.fn();
      renderWithAuthAndCallback(true, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goal-1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(onAction).toHaveBeenCalledWith('update', null);
      });
    });

    it('deletes goal via API', async () => {
      const user = userEvent.setup();
      mockedApi.deleteGoal.mockResolvedValue({ data: undefined });

      const onAction = jest.fn();
      renderWithAuthAndCallback(true, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Delete Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('0');
      });
      expect(onAction).toHaveBeenCalledWith('delete', true);
    });

    it('handles delete goal error', async () => {
      const user = userEvent.setup();
      mockedApi.deleteGoal.mockResolvedValue({ error: 'Failed to delete' });

      const onAction = jest.fn();
      renderWithAuthAndCallback(true, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Delete Goal'));

      await waitFor(() => {
        expect(onAction).toHaveBeenCalledWith('delete', false);
      });
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to delete');
    });

    it('refreshes goals', async () => {
      const user = userEvent.setup();
      renderWithAuth(true);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });

      mockedApi.getGoals.mockResolvedValue({ data: { goals: [mockGoal, { ...mockGoal, id: 2 }] } });

      await user.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('2');
      });
    });
  });

  describe('when not authenticated (guest mode)', () => {
    beforeEach(() => {
      mockedGoalStorage.getAll.mockReturnValue([mockGoal]);
    });

    it('loads goals from local storage', async () => {
      renderWithAuth(false);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });
      expect(mockedGoalStorage.getAll).toHaveBeenCalled();
    });

    it('creates goal in local storage', async () => {
      const user = userEvent.setup();
      const newGoal: Goal = {
        ...mockGoal,
        id: 'local_123',
        title: 'Vacation Fund',
        goal_type: 'vacation',
      };
      mockedGoalStorage.create.mockReturnValue(newGoal);

      const onAction = jest.fn();
      renderWithAuthAndCallback(false, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('2');
      });
      expect(mockedGoalStorage.create).toHaveBeenCalledWith(mockGoalInput);
      expect(onAction).toHaveBeenCalledWith('create', newGoal);
    });

    it('updates goal in local storage', async () => {
      const user = userEvent.setup();
      const updatedGoal: Goal = { ...mockGoal, title: 'Updated Title' };
      mockedGoalStorage.update.mockReturnValue(updatedGoal);

      const onAction = jest.fn();
      renderWithAuthAndCallback(false, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Emergency Fund');
      });

      await user.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Updated Title');
      });
      expect(mockedGoalStorage.update).toHaveBeenCalledWith(1, { title: 'Updated Title' });
      expect(onAction).toHaveBeenCalledWith('update', updatedGoal);
    });

    it('updates goal with multiple goals in local storage (line 78)', async () => {
      const goal2: Goal = { ...mockGoal, id: 2, title: 'Second Goal' };
      mockedGoalStorage.getAll.mockReturnValue([mockGoal, goal2]);

      const user = userEvent.setup();
      const updatedGoal: Goal = { ...mockGoal, title: 'Updated Title' };
      mockedGoalStorage.update.mockReturnValue(updatedGoal);

      const onAction = jest.fn();
      renderWithAuthAndCallback(false, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('2');
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Emergency Fund');
        expect(screen.getByTestId('goal-2')).toHaveTextContent('Second Goal');
      });

      await user.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-1')).toHaveTextContent('Updated Title');
        expect(screen.getByTestId('goal-2')).toHaveTextContent('Second Goal');
      });
    });

    it('handles update goal not found in local storage', async () => {
      const user = userEvent.setup();
      mockedGoalStorage.update.mockReturnValue(null);

      const onAction = jest.fn();
      renderWithAuthAndCallback(false, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goal-1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(onAction).toHaveBeenCalledWith('update', null);
      });
    });

    it('deletes goal from local storage', async () => {
      const user = userEvent.setup();
      mockedGoalStorage.delete.mockReturnValue(true);

      const onAction = jest.fn();
      renderWithAuthAndCallback(false, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Delete Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('0');
      });
      expect(mockedGoalStorage.delete).toHaveBeenCalledWith(1);
      expect(onAction).toHaveBeenCalledWith('delete', true);
    });

    it('handles delete goal not found in local storage', async () => {
      const user = userEvent.setup();
      mockedGoalStorage.delete.mockReturnValue(false);

      const onAction = jest.fn();
      renderWithAuthAndCallback(false, onAction);

      await waitFor(() => {
        expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Delete Goal'));

      await waitFor(() => {
        expect(onAction).toHaveBeenCalledWith('delete', false);
      });
      expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
    });
  });
});

describe('useGoals hook', () => {
  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponent() {
      useGoals();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow('useGoals must be used within a GoalsProvider');

    consoleError.mockRestore();
  });
});
