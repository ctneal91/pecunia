import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import { AuthProvider } from '../../../contexts/AuthContext';
import { GoalsProvider } from '../../../contexts/GoalsContext';
import { api } from '../../../services/api';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const renderHome = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <GoalsProvider>
          <Home />
        </GoalsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for API calls
    mockedApi.getGoals.mockResolvedValue({ data: { goals: [] } });
    mockedApi.getDashboard.mockResolvedValue({
      data: {
        stats: {
          total_saved: 0,
          total_target: 0,
          overall_progress: 0,
          goal_count: 0,
          completed_count: 0,
          active_count: 0,
        },
        recent_contributions: [],
        goals_summary: [],
      },
    });
  });

  it('shows welcome message for anonymous user', async () => {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    renderHome();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    });
  });

  it('shows personalized welcome for logged in user with name', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'John', avatar_url: null } }
    });
    renderHome();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back, john/i })).toBeInTheDocument();
    });
  });

  it('shows email username as fallback when no name', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: null, avatar_url: null } }
    });
    renderHome();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
    });
  });
});
