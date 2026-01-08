import { api } from '../api';

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('authentication', () => {
    it('signup calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: {} }),
      });

      await api.signup('test@example.com', 'password', 'password', 'Test User');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/signup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
            password_confirmation: 'password',
            name: 'Test User',
          }),
        })
      );
    });

    it('login calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: {} }),
      });

      await api.login('test@example.com', 'password');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        })
      );
    });

    it('logout calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.logout();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/logout',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('getMe calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: null }),
      });

      await api.getMe();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/me',
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('updateProfile calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: {} }),
      });

      await api.updateProfile({ name: 'Updated Name' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/me',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated Name' }),
        })
      );
    });
  });

  describe('goals', () => {
    it('getGoals calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ goals: [] }),
      });

      await api.getGoals();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/goals', expect.any(Object));
    });

    it('getGoal calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ goal: {} }),
      });

      await api.getGoal(123);

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/goals/123', expect.any(Object));
    });

    it('createGoal calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ goal: {} }),
      });

      const goalData = { title: 'Test Goal', target_amount: 1000, goal_type: 'savings' as const };
      await api.createGoal(goalData);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/goals',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(goalData),
        })
      );
    });

    it('updateGoal calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ goal: {} }),
      });

      await api.updateGoal(123, { title: 'Updated Goal' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/goals/123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ title: 'Updated Goal' }),
        })
      );
    });

    it('deleteGoal calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.deleteGoal(123);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/goals/123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('bulkCreateGoals calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ goals: [] }),
      });

      const goals = [{ title: 'Goal 1', target_amount: 1000, goal_type: 'savings' as const }];
      await api.bulkCreateGoals(goals);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/goals/bulk_create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ goals }),
        })
      );
    });
  });

  describe('contributions', () => {
    it('getContributions calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ contributions: [] }),
      });

      await api.getContributions(123);

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/goals/123/contributions', expect.any(Object));
    });

    it('createContribution calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ contribution: {}, goal: {} }),
      });

      const data = { amount: 100, contributed_at: '2024-01-01' };
      await api.createContribution(123, data);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/goals/123/contributions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('updateContribution calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ contribution: {}, goal: {} }),
      });

      await api.updateContribution(123, 456, { amount: 150 });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/goals/123/contributions/456',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ amount: 150 }),
        })
      );
    });

    it('deleteContribution calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ goal: {} }),
      });

      await api.deleteContribution(123, 456);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/goals/123/contributions/456',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('dashboard', () => {
    it('getDashboard calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ stats: {}, recent_contributions: [], goals_summary: [] }),
      });

      await api.getDashboard();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/dashboard', expect.any(Object));
    });
  });

  describe('groups', () => {
    it('getGroups calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ groups: [] }),
      });

      await api.getGroups();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/groups', expect.any(Object));
    });

    it('getGroup calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ group: {} }),
      });

      await api.getGroup(123);

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/groups/123', expect.any(Object));
    });

    it('createGroup calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ group: {} }),
      });

      const data = { name: 'Test Group', description: 'Test' };
      await api.createGroup(data);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('updateGroup calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ group: {} }),
      });

      const data = { name: 'Updated Group', description: 'Updated' };
      await api.updateGroup(123, data);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      );
    });

    it('deleteGroup calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.deleteGroup(123);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('joinGroup calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ group: {} }),
      });

      await api.joinGroup('INVITE123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/join',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ invite_code: 'INVITE123' }),
        })
      );
    });

    it('regenerateInviteCode calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ group: {} }),
      });

      await api.regenerateInviteCode(123);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/123/regenerate_invite',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('leaveGroup calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.leaveGroup(123);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/123/memberships/leave',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('updateMembership calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ membership: {} }),
      });

      await api.updateMembership(123, 456, 'admin');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/123/memberships/456',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ role: 'admin' }),
        })
      );
    });

    it('removeMember calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.removeMember(123, 456);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/123/memberships/456',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('group invites', () => {
    it('getGroupInvites calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invites: [] }),
      });

      await api.getGroupInvites(123);

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/groups/123/invites', expect.any(Object));
    });

    it('sendInvite calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invite: {} }),
      });

      await api.sendInvite(123, 'test@example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/123/invites',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
    });

    it('resendInvite calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invite: {}, message: 'Sent' }),
      });

      await api.resendInvite(123, 456);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/groups/123/invites/456/resend',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('getInviteDetails calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invite: {} }),
      });

      await api.getInviteDetails('TOKEN123');

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/invites/TOKEN123', expect.any(Object));
    });

    it('acceptInvite calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ group: {} }),
      });

      await api.acceptInvite('TOKEN123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/invites/TOKEN123/accept',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('declineInvite calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Declined' }),
      });

      await api.declineInvite('TOKEN123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/invites/TOKEN123/decline',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('getPendingInvites calls correct endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invites: [] }),
      });

      await api.getPendingInvites();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/invites/pending', expect.any(Object));
    });
  });

  describe('export functions', () => {
    describe('exportGoals', () => {
      it('calls the correct endpoint with json format', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });

        await api.exportGoals('json');

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/exports/goals?format=json',
          expect.objectContaining({ credentials: 'include' })
        );
      });

      it('calls the correct endpoint with csv format', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });

        await api.exportGoals('csv');

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/exports/goals?format=csv',
          expect.objectContaining({ credentials: 'include' })
        );
      });
    });

    describe('exportContributions', () => {
      it('calls the correct endpoint without goal_id', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });

        await api.exportContributions('json');

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/exports/contributions?format=json',
          expect.objectContaining({ credentials: 'include' })
        );
      });

      it('calls the correct endpoint with goal_id', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });

        await api.exportContributions('csv', 123);

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/exports/contributions?format=csv&goal_id=123',
          expect.objectContaining({ credentials: 'include' })
        );
      });
    });

    describe('exportSummary', () => {
      it('calls the correct endpoint', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ summary: {} }),
        });

        await api.exportSummary();

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/exports/summary',
          expect.objectContaining({ credentials: 'include' })
        );
      });
    });

    describe('exportGoalReport', () => {
      it('calls the correct endpoint with goal id', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ goal: {} }),
        });

        await api.exportGoalReport(456);

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/exports/goals/456/report',
          expect.objectContaining({ credentials: 'include' })
        );
      });
    });
  });

  describe('recurring contributions', () => {
    describe('getRecurringContributions', () => {
      it('calls the correct endpoint', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ recurring_contributions: [] }),
        });

        await api.getRecurringContributions(123);

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/goals/123/recurring_contributions',
          expect.objectContaining({ credentials: 'include' })
        );
      });
    });

    describe('createRecurringContribution', () => {
      it('calls the correct endpoint with POST method and data', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ recurring_contribution: {} }),
        });

        const data = {
          amount: 100,
          frequency: 'monthly' as const,
          next_occurrence_at: '2024-01-01',
        };

        await api.createRecurringContribution(123, data);

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/goals/123/recurring_contributions',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include',
          })
        );
      });
    });

    describe('updateRecurringContribution', () => {
      it('calls the correct endpoint with PATCH method and data', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ recurring_contribution: {} }),
        });

        const data = {
          amount: 150,
          is_active: false,
        };

        await api.updateRecurringContribution(123, 456, data);

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/goals/123/recurring_contributions/456',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify(data),
            credentials: 'include',
          })
        );
      });
    });

    describe('deleteRecurringContribution', () => {
      it('calls the correct endpoint with DELETE method', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ message: 'Deleted' }),
        });

        await api.deleteRecurringContribution(123, 456);

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/goals/123/recurring_contributions/456',
          expect.objectContaining({
            method: 'DELETE',
            credentials: 'include',
          })
        );
      });
    });
  });

  describe('categories', () => {
    describe('getGoalsByCategory', () => {
      it('calls the correct endpoint', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ categories: [] }),
        });

        await api.getGoalsByCategory();

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/goals/by_category',
          expect.objectContaining({ credentials: 'include' })
        );
      });
    });
  });

  describe('error handling', () => {
    it('returns error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const result = await api.exportSummary();

      expect(result.error).toBe('Unauthorized');
    });

    it('returns errors array when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ errors: ['Field is required', 'Invalid value'] }),
      });

      const result = await api.createGoal({ title: '', target_amount: 0, goal_type: 'savings' });

      expect(result.error).toBe('Field is required, Invalid value');
      expect(result.errors).toEqual(['Field is required', 'Invalid value']);
    });

    it('returns default error message when no error provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const result = await api.getGoals();

      expect(result.error).toBe('Request failed');
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.exportSummary();

      expect(result.error).toBe('Network error');
    });

    it('handles fetch errors without message', async () => {
      (global.fetch as jest.Mock).mockRejectedValue({});

      const result = await api.login('test@example.com', 'password');

      expect(result.error).toBe('Network error');
    });
  });
});
