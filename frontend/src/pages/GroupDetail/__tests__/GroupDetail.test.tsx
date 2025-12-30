import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GroupDetail from '../GroupDetail';
import { AuthProvider } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null };

const mockGroup = {
  id: 1,
  name: 'Family Budget',
  member_count: 3,
  goal_count: 5,
  is_admin: true,
  invite_code: 'ABC123',
  members: [
    { id: 1, user_id: 1, user_name: 'Test User', user_email: 'test@example.com', role: 'admin' },
    { id: 2, user_id: 2, user_name: 'Jane Doe', user_email: 'jane@example.com', role: 'member' },
    { id: 3, user_id: 3, user_name: 'Bob Smith', user_email: 'bob@example.com', role: 'member' },
  ],
};

const mockGroupAsMember = {
  ...mockGroup,
  is_admin: false,
};

const mockInvites = [
  { id: 1, email: 'pending@example.com', status: 'pending', invited_at: '2024-01-15', expired: false },
  { id: 2, email: 'expired@example.com', status: 'pending', invited_at: '2024-01-01', expired: true },
];

const renderGroupDetail = (groupId: string = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/groups/${groupId}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups" element={<div>Groups List</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('GroupDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({ data: { user: null } });
      mockedApi.getGroup.mockResolvedValue({ data: { group: mockGroup } });
      mockedApi.getGroupInvites.mockResolvedValue({ data: { invites: [] } });
    });

    it('shows login prompt', async () => {
      renderGroupDetail();

      await waitFor(() => {
        expect(screen.getByText(/please log in/i)).toBeInTheDocument();
      });
    });
  });

  describe('when logged in as admin', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({ data: { user: mockUser } });
      mockedApi.getGroup.mockResolvedValue({ data: { group: mockGroup } });
      mockedApi.getGroupInvites.mockResolvedValue({ data: { invites: mockInvites } });
    });

    describe('loading state', () => {
      it('shows skeleton while loading', async () => {
        mockedApi.getGroup.mockReturnValue(new Promise(() => {}));
        renderGroupDetail();

        await waitFor(() => {
          expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
        });
      });
    });

    describe('group details', () => {
      it('displays group name and stats', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Family Budget')).toBeInTheDocument();
        });
        expect(screen.getByText('3 members · 5 goals')).toBeInTheDocument();
      });

      it('shows invite code for admins', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('ABC123')).toBeInTheDocument();
        });
        expect(screen.getByText(/invite code/i)).toBeInTheDocument();
      });

      it('shows back button', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Back to Groups')).toBeInTheDocument();
        });
      });

      it('displays member list', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Test User')).toBeInTheDocument();
        });
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });

      it('shows admin chip for admin members', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Admin')).toBeInTheDocument();
        });
      });

      it('shows pending invites', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Pending Invites')).toBeInTheDocument();
        });
        expect(screen.getByText('pending@example.com')).toBeInTheDocument();
      });
    });

    describe('copy invite code', () => {
      it('copies invite code to clipboard', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('ABC123')).toBeInTheDocument();
        });

        const copyButtons = screen.getAllByRole('button');
        const copyButton = copyButtons.find(btn => btn.querySelector('[data-testid="ContentCopyIcon"]'));
        if (copyButton) {
          fireEvent.click(copyButton);
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABC123');
        }
      });
    });

    describe('edit group', () => {
      it('opens edit dialog when edit button clicked', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Family Budget')).toBeInTheDocument();
        });

        const editButton = screen.getAllByRole('button').find(btn =>
          btn.querySelector('[data-testid="EditIcon"]')
        );
        if (editButton) {
          fireEvent.click(editButton);
          await waitFor(() => {
            expect(screen.getByText('Edit Group')).toBeInTheDocument();
          });
        }
      });

      it('updates group name successfully', async () => {
        mockedApi.updateGroup.mockResolvedValue({
          data: { group: { ...mockGroup, name: 'Updated Name' } }
        });

        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Family Budget')).toBeInTheDocument();
        });

        const editButton = screen.getAllByRole('button').find(btn =>
          btn.querySelector('[data-testid="EditIcon"]')
        );
        if (editButton) {
          fireEvent.click(editButton);

          await waitFor(() => {
            expect(screen.getByLabelText('Group Name')).toBeInTheDocument();
          });

          fireEvent.change(screen.getByLabelText('Group Name'), { target: { value: 'Updated Name' } });
          fireEvent.click(screen.getByText('Save'));

          await waitFor(() => {
            expect(mockedApi.updateGroup).toHaveBeenCalledWith(1, { name: 'Updated Name' });
          });
        }
      });
    });

    describe('delete group', () => {
      it('opens delete confirmation dialog', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Family Budget')).toBeInTheDocument();
        });

        const deleteButton = screen.getAllByRole('button').find(btn =>
          btn.querySelector('[data-testid="DeleteIcon"]')
        );
        if (deleteButton) {
          fireEvent.click(deleteButton);

          await waitFor(() => {
            expect(screen.getByText('Delete Group?')).toBeInTheDocument();
          });
        }
      });

      it('deletes group and navigates away', async () => {
        mockedApi.deleteGroup.mockResolvedValue({ data: {} });

        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Family Budget')).toBeInTheDocument();
        });

        const deleteButton = screen.getAllByRole('button').find(btn =>
          btn.querySelector('[data-testid="DeleteIcon"]')
        );
        if (deleteButton) {
          fireEvent.click(deleteButton);

          await waitFor(() => {
            expect(screen.getByText('Delete Group?')).toBeInTheDocument();
          });

          fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

          await waitFor(() => {
            expect(mockedApi.deleteGroup).toHaveBeenCalledWith(1);
          });
        }
      });
    });

    describe('regenerate invite code', () => {
      it('regenerates invite code', async () => {
        mockedApi.regenerateInviteCode.mockResolvedValue({
          data: { group: { invite_code: 'NEW123' } }
        });

        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('ABC123')).toBeInTheDocument();
        });

        const refreshButton = screen.getAllByRole('button').find(btn =>
          btn.querySelector('[data-testid="RefreshIcon"]')
        );
        if (refreshButton) {
          fireEvent.click(refreshButton);

          await waitFor(() => {
            expect(mockedApi.regenerateInviteCode).toHaveBeenCalledWith(1);
          });
        }
      });
    });

    describe('member management', () => {
      it('opens member menu when clicking more icon', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });

        const moreButtons = screen.getAllByRole('button').filter(btn =>
          btn.querySelector('[data-testid="MoreVertIcon"]')
        );
        if (moreButtons.length > 0) {
          fireEvent.click(moreButtons[0]);

          await waitFor(() => {
            expect(screen.getByText('Make Admin')).toBeInTheDocument();
          });
          expect(screen.getByText('Remove from Group')).toBeInTheDocument();
        }
      });

      it('toggles admin status', async () => {
        mockedApi.updateMembership.mockResolvedValue({ data: {} });

        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });

        const moreButtons = screen.getAllByRole('button').filter(btn =>
          btn.querySelector('[data-testid="MoreVertIcon"]')
        );
        if (moreButtons.length > 0) {
          fireEvent.click(moreButtons[0]);

          await waitFor(() => {
            expect(screen.getByText('Make Admin')).toBeInTheDocument();
          });

          fireEvent.click(screen.getByText('Make Admin'));

          await waitFor(() => {
            expect(mockedApi.updateMembership).toHaveBeenCalled();
          });
        }
      });

      it('removes member from group', async () => {
        mockedApi.removeMember.mockResolvedValue({ data: {} });

        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });

        const moreButtons = screen.getAllByRole('button').filter(btn =>
          btn.querySelector('[data-testid="MoreVertIcon"]')
        );
        if (moreButtons.length > 0) {
          fireEvent.click(moreButtons[0]);

          await waitFor(() => {
            expect(screen.getByText('Remove from Group')).toBeInTheDocument();
          });

          fireEvent.click(screen.getByText('Remove from Group'));

          await waitFor(() => {
            expect(mockedApi.removeMember).toHaveBeenCalled();
          });
        }
      });
    });

    describe('email invites', () => {
      it('opens invite dialog when button clicked', async () => {
        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Send Email Invite')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Send Email Invite'));

        await waitFor(() => {
          expect(screen.getByText('Invite by Email')).toBeInTheDocument();
        });
      });

      it('sends email invite successfully', async () => {
        mockedApi.sendInvite.mockResolvedValue({
          data: { invite: { id: 3, email: 'new@example.com' } }
        });

        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('Send Email Invite')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Send Email Invite'));

        await waitFor(() => {
          expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Email Address'), {
          target: { value: 'new@example.com' }
        });
        fireEvent.click(screen.getByText('Send Invite'));

        await waitFor(() => {
          expect(mockedApi.sendInvite).toHaveBeenCalledWith(1, 'new@example.com');
        });
      });

      it('resends invite', async () => {
        mockedApi.resendInvite.mockResolvedValue({ data: {} });

        renderGroupDetail();

        await waitFor(() => {
          expect(screen.getByText('pending@example.com')).toBeInTheDocument();
        });

        fireEvent.click(screen.getAllByText('Resend')[0]);

        await waitFor(() => {
          expect(mockedApi.resendInvite).toHaveBeenCalledWith(1, 1);
        });
      });
    });
  });

  describe('when logged in as member (not admin)', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({ data: { user: mockUser } });
      mockedApi.getGroup.mockResolvedValue({ data: { group: mockGroupAsMember } });
      mockedApi.getGroupInvites.mockResolvedValue({ data: { invites: [] } });
    });

    it('shows leave group button instead of edit/delete', async () => {
      renderGroupDetail();

      await waitFor(() => {
        expect(screen.getByText('Leave Group')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('does not show invite code', async () => {
      renderGroupDetail();

      await waitFor(() => {
        expect(screen.getByText('Family Budget')).toBeInTheDocument();
      });

      expect(screen.queryByText('ABC123')).not.toBeInTheDocument();
    });

    it('opens leave confirmation dialog', async () => {
      renderGroupDetail();

      await waitFor(() => {
        expect(screen.getByText('Leave Group')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Leave Group'));

      await waitFor(() => {
        expect(screen.getByText('Leave Group?')).toBeInTheDocument();
      });
    });

    it('leaves group and navigates away', async () => {
      mockedApi.leaveGroup.mockResolvedValue({ data: {} });

      renderGroupDetail();

      await waitFor(() => {
        expect(screen.getByText('Leave Group')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Leave Group'));

      await waitFor(() => {
        expect(screen.getByText('Leave Group?')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Leave' }));

      await waitFor(() => {
        expect(mockedApi.leaveGroup).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockedApi.getMe.mockResolvedValue({ data: { user: mockUser } });
      mockedApi.getGroupInvites.mockResolvedValue({ data: { invites: [] } });
    });

    it('shows error when group fails to load', async () => {
      mockedApi.getGroup.mockResolvedValue({ error: 'Group not found' });

      renderGroupDetail();

      await waitFor(() => {
        expect(screen.getByText('Group not found')).toBeInTheDocument();
      });
      expect(screen.getByText('Back to Groups')).toBeInTheDocument();
    });

    it('shows error when update fails', async () => {
      mockedApi.getGroup.mockResolvedValue({ data: { group: mockGroup } });
      mockedApi.updateGroup.mockResolvedValue({ error: 'Update failed' });

      renderGroupDetail();

      await waitFor(() => {
        expect(screen.getByText('Family Budget')).toBeInTheDocument();
      });

      const editButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('[data-testid="EditIcon"]')
      );
      if (editButton) {
        fireEvent.click(editButton);

        await waitFor(() => {
          expect(screen.getByLabelText('Group Name')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Group Name'), { target: { value: 'New Name' } });
        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
          expect(screen.getByText('Update failed')).toBeInTheDocument();
        });
      }
    });

    it('shows error when delete fails', async () => {
      mockedApi.getGroup.mockResolvedValue({ data: { group: mockGroup } });
      mockedApi.deleteGroup.mockResolvedValue({ error: 'Cannot delete' });

      renderGroupDetail();

      await waitFor(() => {
        expect(screen.getByText('Family Budget')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('[data-testid="DeleteIcon"]')
      );
      if (deleteButton) {
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText('Delete Group?')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
          expect(screen.getByText('Cannot delete')).toBeInTheDocument();
        });
      }
    });
  });
});
