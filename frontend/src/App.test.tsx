import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { api } from './services/api';

jest.mock('./services/api');
const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getMe.mockResolvedValue({ data: { user: null } });
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

test('renders app with navigation', async () => {
  render(<App />);
  await waitFor(() => {
    // Find the title link in the navbar
    const appTitle = screen.getByRole('link', { name: /Pecunia/i });
    expect(appTitle).toBeInTheDocument();
  });
});

test('renders login and signup links when not authenticated', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign Up/i })).toBeInTheDocument();
  });
});
