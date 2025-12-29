import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import { AuthProvider } from '../contexts/AuthContext';
import { api } from '../services/api';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const renderHome = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Home />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows welcome message for anonymous user', async () => {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    renderHome();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/sign up or log in/i)).toBeInTheDocument();
  });

  it('shows personalized welcome for logged in user with name', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'John', avatar_url: null } }
    });
    renderHome();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome, john/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/you are logged in/i)).toBeInTheDocument();
  });

  it('shows email as fallback when no name', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: null, avatar_url: null } }
    });
    renderHome();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome, test@example.com/i })).toBeInTheDocument();
    });
  });
});
