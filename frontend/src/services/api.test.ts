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
});
