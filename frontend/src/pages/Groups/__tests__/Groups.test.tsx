import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Groups from '../Groups';
import { AuthProvider } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { Group } from '../../../types/group';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockGroup: Group = {
  id: 1,
  name: 'Family Budget',
  invite_code: 'ABC123',
  member_count: 3,
  goal_count: 5,
  is_admin: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const memberGroup: Group = {
  ...mockGroup,
  id: 2,
  name: 'Roommates',
  is_admin: false,
};

const renderGroups = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Groups />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Groups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
    });

    it('shows login prompt', async () => {
      renderGroups();

      await waitFor(() => {
        expect(screen.getByText(/please log in/i)).toBeInTheDocument();
      });
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({
        data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
      });
    });

    describe('loading state', () => {
      it('shows skeleton while loading', async () => {
        mockedApi.getGroups.mockReturnValue(new Promise(() => {}));
        renderGroups();
        // Wait for auth to resolve first, then skeleton appears while groups load
        await waitFor(() => {
          expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
        });
      });
    });

    describe('empty state', () => {
      it('shows empty state message', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('No Groups Yet')).toBeInTheDocument();
        });
        expect(screen.getByText(/create a group to share goals/i)).toBeInTheDocument();
      });

      it('has create and join buttons in empty state', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('No Groups Yet')).toBeInTheDocument();
        });
        expect(screen.getByText('Join with Invite Code')).toBeInTheDocument();
        // There are two Create Group buttons - one in header, one in empty state
        expect(screen.getAllByText('Create Group').length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('groups list', () => {
      it('displays groups', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [mockGroup] } });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Family Budget')).toBeInTheDocument();
        });
        expect(screen.getByText('3 members · 5 goals')).toBeInTheDocument();
      });

      it('shows admin chip for admin users', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [mockGroup] } });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Admin')).toBeInTheDocument();
        });
      });

      it('does not show admin chip for regular members', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [memberGroup] } });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Roommates')).toBeInTheDocument();
        });
        expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      });

      it('handles singular member count', async () => {
        mockedApi.getGroups.mockResolvedValue({
          data: { groups: [{ ...mockGroup, member_count: 1, goal_count: 1 }] }
        });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('1 member · 1 goal')).toBeInTheDocument();
        });
      });

      it('navigates to group detail when clicked', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [mockGroup] } });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Family Budget')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Family Budget'));
        expect(mockNavigate).toHaveBeenCalledWith('/groups/1');
      });
    });

    describe('create group dialog', () => {
      it('opens create dialog when button clicked', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [mockGroup] } });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Create Group')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Create Group'));
        expect(screen.getByText('Create New Group')).toBeInTheDocument();
      });

      it('creates group successfully', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
        mockedApi.createGroup.mockResolvedValue({
          data: { group: { ...mockGroup, id: 2, name: 'New Group' } }
        });
        renderGroups();

        await waitFor(() => {
          expect(screen.getAllByText('Create Group')[0]).toBeInTheDocument();
        });

        fireEvent.click(screen.getAllByText('Create Group')[0]);

        const input = screen.getByLabelText('Group Name');
        fireEvent.change(input, { target: { value: 'New Group' } });

        fireEvent.click(screen.getByText('Create'));

        await waitFor(() => {
          expect(mockedApi.createGroup).toHaveBeenCalledWith({ name: 'New Group' });
        });
      });

      it('shows error when create fails', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
        mockedApi.createGroup.mockResolvedValue({ error: 'Name is required' });
        renderGroups();

        await waitFor(() => {
          expect(screen.getAllByText('Create Group')[0]).toBeInTheDocument();
        });

        fireEvent.click(screen.getAllByText('Create Group')[0]);

        const input = screen.getByLabelText('Group Name');
        fireEvent.change(input, { target: { value: 'Test' } });
        fireEvent.click(screen.getByText('Create'));

        await waitFor(() => {
          expect(screen.getByText('Name is required')).toBeInTheDocument();
        });
      });
    });

    describe('join group dialog', () => {
      it('opens join dialog when button clicked', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [mockGroup] } });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Join Group')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Join Group'));
        expect(screen.getByLabelText('Invite Code')).toBeInTheDocument();
      });

      it('joins group successfully', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
        mockedApi.joinGroup.mockResolvedValue({
          data: { group: mockGroup }
        });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Join with Invite Code')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Join with Invite Code'));

        const input = screen.getByLabelText('Invite Code');
        fireEvent.change(input, { target: { value: 'ABC123' } });

        fireEvent.click(screen.getByRole('button', { name: 'Join' }));

        await waitFor(() => {
          expect(mockedApi.joinGroup).toHaveBeenCalledWith('ABC123');
        });
      });

      it('shows error when join fails', async () => {
        mockedApi.getGroups.mockResolvedValue({ data: { groups: [] } });
        mockedApi.joinGroup.mockResolvedValue({ error: 'Invalid invite code' });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Join with Invite Code')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Join with Invite Code'));

        const input = screen.getByLabelText('Invite Code');
        fireEvent.change(input, { target: { value: 'INVALID' } });
        fireEvent.click(screen.getByRole('button', { name: 'Join' }));

        await waitFor(() => {
          expect(screen.getByText('Invalid invite code')).toBeInTheDocument();
        });
      });
    });

    describe('error state', () => {
      it('shows error message when loading fails', async () => {
        mockedApi.getGroups.mockResolvedValue({ error: 'Failed to load groups' });
        renderGroups();

        await waitFor(() => {
          expect(screen.getByText('Failed to load groups')).toBeInTheDocument();
        });
      });
    });
  });
});
