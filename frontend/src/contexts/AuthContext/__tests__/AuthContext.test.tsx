import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import { api } from '../../../services/api';
import { goalStorage } from '../../../services/goalStorage';

// Mock the API and goalStorage
jest.mock('../../../services/api');
jest.mock('../../../services/goalStorage');
const mockedApi = api as jest.Mocked<typeof api>;
const mockedGoalStorage = goalStorage as jest.Mocked<typeof goalStorage>;

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, login, logout, signup, updateProfile } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => signup('new@example.com', 'password', 'password', 'New User')}>Signup</button>
      <button onClick={() => updateProfile({ name: 'Updated' })}>Update</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockedApi.getMe.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows no user when not logged in', async () => {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('shows user when logged in', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('handles login', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue([]);
    mockedApi.login.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('handles login error', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue([]);
    mockedApi.login.mockResolvedValue({ error: 'Invalid credentials' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('handles login response with no user data (line 52)', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue([]);
    // @ts-expect-error Testing edge case where data exists but user is undefined
    mockedApi.login.mockResolvedValue({ data: {} });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('handles logout', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });
    mockedApi.logout.mockResolvedValue({ data: undefined });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('handles signup', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue([]);
    mockedApi.signup.mockResolvedValue({
      data: { user: { id: 1, email: 'new@example.com', name: 'New User', avatar_url: null } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Signup'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('new@example.com');
    });
  });

  it('handles signup error', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedApi.signup.mockResolvedValue({ error: 'Email taken' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Signup'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('handles profile update', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });
    mockedApi.updateProfile.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Updated', avatar_url: null } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    await user.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(mockedApi.updateProfile).toHaveBeenCalledWith({ name: 'Updated' });
    });
  });

  it('handles profile update error', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });
    mockedApi.updateProfile.mockResolvedValue({ error: 'Invalid data' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    await user.click(screen.getByText('Update'));

    // User should still be there after failed update
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });
});

describe('useAuth hook', () => {
  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponent() {
      useAuth();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });
});

describe('syncGuestGoals (lines 28-41)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('syncs guest goals on successful login', async () => {
    const user = userEvent.setup();
    const mockGuestGoals = [
      {
        id: 1,
        title: 'Emergency Fund',
        description: 'Save for emergencies',
        target_amount: 5000,
        current_amount: 1000,
        goal_type: 'savings' as const,
        target_date: '2025-12-31',
        icon: 'emergency',
        color: '#FF5722',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contributions: [],
        progress_percentage: 20,
        remaining_amount: 4000,
        completed: false,
        group_id: null,
        group_name: null,
      },
      {
        id: 2,
        title: 'Vacation',
        description: null,
        target_amount: 3000,
        current_amount: 500,
        goal_type: 'vacation' as const,
        target_date: null,
        icon: null,
        color: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contributions: [],
        progress_percentage: 16.67,
        remaining_amount: 2500,
        completed: false,
        group_id: null,
        group_name: null,
      },
    ];

    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue(mockGuestGoals);
    mockedApi.bulkCreateGoals.mockResolvedValue({ data: { goals: [] } });
    mockedApi.login.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockedApi.bulkCreateGoals).toHaveBeenCalledWith([
        {
          title: 'Emergency Fund',
          description: 'Save for emergencies',
          target_amount: 5000,
          current_amount: 1000,
          goal_type: 'savings',
          target_date: '2025-12-31',
          icon: 'emergency',
          color: '#FF5722',
        },
        {
          title: 'Vacation',
          description: undefined,
          target_amount: 3000,
          current_amount: 500,
          goal_type: 'vacation',
          target_date: undefined,
          icon: undefined,
          color: undefined,
        },
      ]);
    });

    expect(mockedGoalStorage.clear).toHaveBeenCalled();
  });

  it('syncs guest goals on successful signup', async () => {
    const user = userEvent.setup();
    const mockGuestGoals = [
      {
        id: 1,
        title: 'Car',
        description: 'New car',
        target_amount: 20000,
        current_amount: 5000,
        goal_type: 'vehicle' as const,
        target_date: '2026-06-01',
        icon: 'car',
        color: '#2196F3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contributions: [],
        progress_percentage: 25,
        remaining_amount: 15000,
        completed: false,
        group_id: null,
        group_name: null,
      },
    ];

    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue(mockGuestGoals);
    mockedApi.bulkCreateGoals.mockResolvedValue({ data: { goals: [] } });
    mockedApi.signup.mockResolvedValue({
      data: { user: { id: 1, email: 'new@example.com', name: 'New User', avatar_url: null } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Signup'));

    await waitFor(() => {
      expect(mockedApi.bulkCreateGoals).toHaveBeenCalledWith([
        {
          title: 'Car',
          description: 'New car',
          target_amount: 20000,
          current_amount: 5000,
          goal_type: 'vehicle',
          target_date: '2026-06-01',
          icon: 'car',
          color: '#2196F3',
        },
      ]);
    });

    expect(mockedGoalStorage.clear).toHaveBeenCalled();
  });

  it('does not sync when no guest goals exist', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue([]);
    mockedApi.login.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    expect(mockedApi.bulkCreateGoals).not.toHaveBeenCalled();
    expect(mockedGoalStorage.clear).not.toHaveBeenCalled();
  });

  it('does not clear guest goals when sync fails', async () => {
    const user = userEvent.setup();
    const mockGuestGoals = [
      {
        id: 1,
        title: 'Goal',
        description: null,
        target_amount: 1000,
        current_amount: 0,
        goal_type: 'savings' as const,
        target_date: null,
        icon: null,
        color: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contributions: [],
        progress_percentage: 0,
        remaining_amount: 1000,
        completed: false,
        group_id: null,
        group_name: null,
      },
    ];

    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue(mockGuestGoals);
    mockedApi.bulkCreateGoals.mockResolvedValue({ error: 'Network error' });
    mockedApi.login.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockedApi.bulkCreateGoals).toHaveBeenCalled();
    });

    expect(mockedGoalStorage.clear).not.toHaveBeenCalled();
  });

  it('handles goals with null values correctly (lines 30-36)', async () => {
    const user = userEvent.setup();
    const mockGuestGoal = [
      {
        id: 1,
        title: 'Minimal Goal',
        description: null,
        target_amount: 100,
        current_amount: 0,
        goal_type: 'savings' as const,
        target_date: null,
        icon: null,
        color: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contributions: [],
        progress_percentage: 0,
        remaining_amount: 100,
        completed: false,
        group_id: null,
        group_name: null,
      },
    ];

    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    mockedGoalStorage.getAll.mockReturnValue(mockGuestGoal);
    mockedApi.bulkCreateGoals.mockResolvedValue({ data: { goals: [] } });
    mockedApi.login.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockedApi.bulkCreateGoals).toHaveBeenCalledWith([
        {
          title: 'Minimal Goal',
          description: undefined,
          target_amount: 100,
          current_amount: 0,
          goal_type: 'savings',
          target_date: undefined,
          icon: undefined,
          color: undefined,
        },
      ]);
    });
  });
});
