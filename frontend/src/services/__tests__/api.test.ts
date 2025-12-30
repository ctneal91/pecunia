import { api } from '../api';

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
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

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await api.exportSummary();

      expect(result.error).toBe('Network error');
    });
  });
});
