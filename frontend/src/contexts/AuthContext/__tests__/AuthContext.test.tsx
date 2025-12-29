import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import { api } from '../../../services/api';

// Mock the API
jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

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
