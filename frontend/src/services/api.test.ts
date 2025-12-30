import { api } from './api';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('signup', () => {
    it('sends signup request with correct data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, email: 'test@example.com' } }),
      });

      const result = await api.signup('test@example.com', 'password', 'password', 'Test User');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
          password_confirmation: 'password',
          name: 'Test User',
        }),
      });
      expect(result.data?.user.email).toBe('test@example.com');
    });

    it('handles signup error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ errors: ['Email has already been taken'] }),
      });

      const result = await api.signup('test@example.com', 'password', 'password');

      expect(result.error).toBe('Email has already been taken');
    });
  });

  describe('login', () => {
    it('sends login request with correct data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, email: 'test@example.com' } }),
      });

      const result = await api.login('test@example.com', 'password');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      });
      expect(result.data?.user.email).toBe('test@example.com');
    });

    it('handles login error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid email or password' }),
      });

      const result = await api.login('test@example.com', 'wrong');

      expect(result.error).toBe('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('sends logout request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.logout();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/logout', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getMe', () => {
    it('sends getMe request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, email: 'test@example.com' } }),
      });

      const result = await api.getMe();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result.data?.user?.email).toBe('test@example.com');
    });

    it('returns null user when not logged in', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: null }),
      });

      const result = await api.getMe();

      expect(result.data?.user).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('sends update request with correct data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, email: 'test@example.com', name: 'Updated' } }),
      });

      const result = await api.updateProfile({ name: 'Updated' });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      });
      expect(result.data?.user.name).toBe('Updated');
    });

    it('handles update error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ errors: ['Password is too short'] }),
      });

      const result = await api.updateProfile({ password: '123' });

      expect(result.error).toBe('Password is too short');
    });
  });

  describe('network errors', () => {
    it('handles network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await api.login('test@example.com', 'password');

      expect(result.error).toBe('Network error');
    });
  });

  describe('goals', () => {
    it('getGoals sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ goals: [] }),
      });

      await api.getGoals();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('getGoal sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ goal: { id: 1 } }),
      });

      await api.getGoal(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals/1', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('createGoal sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ goal: { id: 1, title: 'New Goal' } }),
      });

      await api.createGoal({ title: 'New Goal', target_amount: 1000, goal_type: 'savings' });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Goal', target_amount: 1000, goal_type: 'savings' }),
      });
    });

    it('updateGoal sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ goal: { id: 1, title: 'Updated' } }),
      });

      await api.updateGoal(1, { title: 'Updated' });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals/1', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });
    });

    it('deleteGoal sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.deleteGoal(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals/1', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('bulkCreateGoals sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ goals: [] }),
      });

      const goals = [
        { title: 'Goal 1', target_amount: 100, goal_type: 'savings' as const },
        { title: 'Goal 2', target_amount: 200, goal_type: 'savings' as const },
      ];
      await api.bulkCreateGoals(goals);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals/bulk_create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals }),
      });
    });
  });

  describe('contributions', () => {
    it('getContributions sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ contributions: [] }),
      });

      await api.getContributions(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals/1/contributions', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('createContribution sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ contribution: { id: 1 }, goal: { id: 1 } }),
      });

      await api.createContribution(1, { amount: 50, note: 'Test', contributed_at: '2024-01-15' });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals/1/contributions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50, note: 'Test', contributed_at: '2024-01-15' }),
      });
    });

    it('updateContribution sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ contribution: { id: 1 }, goal: { id: 1 } }),
      });

      await api.updateContribution(1, 2, { amount: 100 });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals/1/contributions/2', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100 }),
      });
    });

    it('deleteContribution sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ goal: { id: 1 } }),
      });

      await api.deleteContribution(1, 2);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/goals/1/contributions/2', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('dashboard', () => {
    it('getDashboard sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ stats: {}, recent_contributions: [], goals_summary: [] }),
      });

      await api.getDashboard();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/dashboard', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('groups', () => {
    it('getGroups sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ groups: [] }),
      });

      await api.getGroups();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('getGroup sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ group: { id: 1 } }),
      });

      await api.getGroup(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('createGroup sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ group: { id: 1 } }),
      });

      await api.createGroup({ name: 'Family' });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Family' }),
      });
    });

    it('updateGroup sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ group: { id: 1 } }),
      });

      await api.updateGroup(1, { name: 'Updated' });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      });
    });

    it('deleteGroup sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.deleteGroup(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('joinGroup sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ group: { id: 1 } }),
      });

      await api.joinGroup('ABC123');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/join', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: 'ABC123' }),
      });
    });

    it('regenerateInviteCode sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ group: { id: 1, invite_code: 'NEW123' } }),
      });

      await api.regenerateInviteCode(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1/regenerate_invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('leaveGroup sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.leaveGroup(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1/memberships/leave', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('updateMembership sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ membership: { id: 1 } }),
      });

      await api.updateMembership(1, 2, 'admin');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1/memberships/2', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
    });

    it('removeMember sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.removeMember(1, 2);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1/memberships/2', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('group invites', () => {
    it('getGroupInvites sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invites: [] }),
      });

      await api.getGroupInvites(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1/invites', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('sendInvite sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invite: { id: 1 } }),
      });

      await api.sendInvite(1, 'friend@example.com');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1/invites', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'friend@example.com' }),
      });
    });

    it('resendInvite sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invite: { id: 1 }, message: 'Sent' }),
      });

      await api.resendInvite(1, 2);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/groups/1/invites/2/resend', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('getInviteDetails sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invite: { token: 'abc123' } }),
      });

      await api.getInviteDetails('abc123');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/invites/abc123', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('acceptInvite sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ group: { id: 1 } }),
      });

      await api.acceptInvite('abc123');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/invites/abc123/accept', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('declineInvite sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Declined' }),
      });

      await api.declineInvite('abc123');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/invites/abc123/decline', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('getPendingInvites sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invites: [] }),
      });

      await api.getPendingInvites();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/invites/pending', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('error handling edge cases', () => {
    it('handles response with no error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const result = await api.getMe();

      expect(result.error).toBe('Request failed');
    });
  });
});
