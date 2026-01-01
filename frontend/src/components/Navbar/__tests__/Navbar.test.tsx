import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows login and signup links when not authenticated', async () => {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    renderNavbar();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  it('shows user avatar when authenticated', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    renderNavbar();

    await waitFor(() => {
      // Avatar should show first letter of name
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  it('shows user menu on avatar click', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    renderNavbar();

    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
    });
  });

  it('logs out user', async () => {
    const user = userEvent.setup();
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    mockedApi.logout.mockResolvedValue({ data: undefined });

    renderNavbar();

    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('menuitem', { name: /logout/i }));

    await waitFor(() => {
      expect(mockedApi.logout).toHaveBeenCalled();
    });
  });

  it('shows app title link to home', async () => {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    renderNavbar();

    await waitFor(() => {
      const titleLink = screen.getByRole('link', { name: /pecunia/i });
      expect(titleLink).toBeInTheDocument();
      expect(titleLink).toHaveAttribute('href', '/');
    });
  });

  it('shows first letter of email when user has no name', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: null, avatar_url: null } }
    });
    renderNavbar();

    await waitFor(() => {
      // Avatar should show first letter of email when name is null
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  it('shows avatar with user avatar_url when provided', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }
    });
    renderNavbar();

    await waitFor(() => {
      const avatar = screen.getByAltText('Test User');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('shows Groups link when user is authenticated', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    renderNavbar();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /groups/i })).toBeInTheDocument();
    });
  });

  it('hides Groups link when user is not authenticated', async () => {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    renderNavbar();

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /groups/i })).not.toBeInTheDocument();
    });
  });
});
