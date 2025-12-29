import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../Profile';
import { AuthProvider } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Profile />
      </AuthProvider>
    </BrowserRouter>
  );
};

// Helper to get MUI TextField inputs by label text
const getInputByLabel = (labelText: string | RegExp) => {
  const allInputs = Array.from(document.querySelectorAll('input'));
  for (const input of allInputs) {
    const formControl = input.closest('.MuiFormControl-root');
    const label = formControl?.querySelector('label');
    if (label && (typeof labelText === 'string' ? label.textContent?.includes(labelText) : labelText.test(label.textContent || ''))) {
      return input;
    }
  }
  throw new Error(`Could not find input with label "${labelText}"`);
};

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when not authenticated', async () => {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    renderProfile();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders profile form when authenticated', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: 'http://example.com/avatar.jpg' } }
    });
    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });
  });

  it('updates profile successfully', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    mockedApi.updateProfile.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Updated', avatar_url: null } }
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });

    const nameInput = getInputByLabel('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });

    const newPasswordInput = getInputByLabel('New Password');
    const confirmPasswordInput = getInputByLabel('Confirm New Password');

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    });
  });

  it('shows error on failed update', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    mockedApi.updateProfile.mockResolvedValue({ error: 'Update failed' });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });

    const nameInput = getInputByLabel('Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Update failed');
    });
  });

  it('updates password with matching confirmation', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    mockedApi.updateProfile.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });

    const newPasswordInput = getInputByLabel('New Password');
    const confirmPasswordInput = getInputByLabel('Confirm New Password');

    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockedApi.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'newpassword123',
          password_confirmation: 'newpassword123',
        })
      );
    });
  });

  it('shows saving state during profile update', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    // Use a promise that we control to keep the loading state active
    let resolveUpdate: (value: { data: { user: { id: number; email: string; name: string; avatar_url: null } } }) => void;
    mockedApi.updateProfile.mockImplementation(() => new Promise(resolve => {
      resolveUpdate = resolve;
    }));

    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });

    const nameInput = getInputByLabel('Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    // Check loading state is shown
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });

    // Resolve the update
    resolveUpdate!({ data: { user: { id: 1, email: 'test@example.com', name: 'New Name', avatar_url: null } } });

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });
});
