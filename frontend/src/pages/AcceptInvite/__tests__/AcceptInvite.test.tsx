import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AcceptInvite from '../AcceptInvite';
import { AuthProvider } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { InviteDetails } from '../../../types/group';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const validInvite: InviteDetails = {
  id: 1,
  status: 'pending',
  group_name: 'Family Budget',
  inviter_name: 'John Doe',
  expired: false,
};

const renderAcceptInvite = (token: string = 'valid-token') => {
  return render(
    <MemoryRouter initialEntries={[`/invites/${token}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/invites/:token" element={<AcceptInvite />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('AcceptInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('invalid invite', () => {
    it('shows error for invalid token', async () => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      mockedApi.getInviteDetails.mockResolvedValue({ error: 'Invalid invitation' });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Invalid Invitation')).toBeInTheDocument();
      });
      expect(screen.getByText('Invalid invitation')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('handles API response with no invite data (line 38-45)', async () => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      // @ts-expect-error - Testing edge case where API returns empty data object
      mockedApi.getInviteDetails.mockResolvedValue({ data: {} });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('expired invite', () => {
    it('shows expired message', async () => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: { ...validInvite, expired: true } }
      });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Invitation Expired')).toBeInTheDocument();
      });
      expect(screen.getByText(/has expired/i)).toBeInTheDocument();
    });
  });

  describe('already processed invite', () => {
    it('shows message for accepted invite', async () => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: { ...validInvite, status: 'accepted' } }
      });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Invitation Already Accepted')).toBeInTheDocument();
      });
    });

    it('shows message for declined invite', async () => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: { ...validInvite, status: 'declined' } }
      });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /invitation.*declined/i })).toBeInTheDocument();
      });
    });
  });

  describe('when not logged in', () => {
    it('shows login/register prompt', async () => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText("You're Invited!")).toBeInTheDocument();
      });
      expect(screen.getByText('John Doe invited you to join')).toBeInTheDocument();
      expect(screen.getByText('Family Budget')).toBeInTheDocument();
      expect(screen.getByText(/log in or create an account/i)).toBeInTheDocument();
      expect(screen.getByText('Log In')).toBeInTheDocument();
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
    });

    it('shows accept/decline buttons', async () => {
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText("You're Invited!")).toBeInTheDocument();
      });
      expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    it('accepts invite successfully', async () => {
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      mockedApi.acceptInvite.mockResolvedValue({
        data: { group: { id: 1, name: 'Family Budget', invite_code: 'ABC', member_count: 2, goal_count: 0, is_admin: false, created_at: '', updated_at: '' } }
      });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Accept Invitation'));

      await waitFor(() => {
        expect(screen.getByText('Welcome to Family Budget!')).toBeInTheDocument();
      });
    });

    it('navigates to group page after accepting invite (line 56)', async () => {
      jest.useFakeTimers();
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      mockedApi.acceptInvite.mockResolvedValue({
        data: { group: { id: 1, name: 'Family Budget', invite_code: 'ABC', member_count: 2, goal_count: 0, is_admin: false, created_at: '', updated_at: '' } }
      });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Accept Invitation'));

      await waitFor(() => {
        expect(screen.getByText('Welcome to Family Budget!')).toBeInTheDocument();
      });

      // Fast-forward timer to trigger navigation
      jest.advanceTimersByTime(2000);

      expect(mockNavigate).toHaveBeenCalledWith('/groups/1');
      jest.useRealTimers();
    });

    it('shows error when accept fails', async () => {
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      mockedApi.acceptInvite.mockResolvedValue({
        error: 'Already a member'
      });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Accept Invitation'));

      await waitFor(() => {
        expect(screen.getByText('Already a member')).toBeInTheDocument();
      });
    });

    it('handles accept response with no data or error (line 53-63)', async () => {
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      // API returns success but no data
      mockedApi.acceptInvite.mockResolvedValue({});
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Accept Invitation'));

      await waitFor(() => {
        // Should not show error or success state
        expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
      });
    });

    it('declines invite successfully', async () => {
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      mockedApi.declineInvite.mockResolvedValue({ data: { message: 'Declined' } });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Decline')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Decline'));

      await waitFor(() => {
        expect(screen.getByText(/invitation declined/i)).toBeInTheDocument();
      });
    });

    it('shows error when decline fails', async () => {
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      mockedApi.declineInvite.mockResolvedValue({ error: 'Something went wrong' });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Decline')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Decline'));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });

    it('clears error when close button is clicked (line 132)', async () => {
      mockedApi.getInviteDetails.mockResolvedValue({
        data: { invite: validInvite }
      });
      mockedApi.acceptInvite.mockResolvedValue({ error: 'Test error' });
      renderAcceptInvite();

      await waitFor(() => {
        expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
      });

      // Trigger an error
      fireEvent.click(screen.getByText('Accept Invitation'));

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });

      // Find and click the close button on the Alert
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Test error')).not.toBeInTheDocument();
      });
    });
  });
});
