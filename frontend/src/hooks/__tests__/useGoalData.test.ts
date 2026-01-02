import { renderHook, waitFor } from '@testing-library/react';
import { useGoalData } from '../useGoalData';
import { api } from '../../services/api';
import { Goal, Contribution, RecurringContribution } from '../../types/goal';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockGoal: Goal = {
  id: 1,
  title: 'Emergency Fund',
  description: 'Save for emergencies',
  target_amount: 10000,
  current_amount: 2500,
  goal_type: 'emergency_fund',
  target_date: '2025-12-31',
  icon: null,
  color: '#4CAF50',
  progress_percentage: 25,
  remaining_amount: 7500,
  completed: false,
  group_id: null,
  group_name: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const mockContribution: Contribution = {
  id: 1,
  goal_id: 1,
  user_id: 1,
  amount: 100,
  note: 'Test contribution',
  contributed_at: '2025-01-01T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
};

const mockRecurringContribution: RecurringContribution = {
  id: 1,
  goal_id: 1,
  user_id: 1,
  amount: 50,
  frequency: 'monthly',
  next_occurrence_at: '2025-02-01',
  end_date: null,
  is_active: true,
  note: null,
  created_at: '2025-01-01T00:00:00Z',
};

describe('useGoalData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns early when goalId is undefined (lines 32-33)', async () => {
    const { result } = renderHook(() => useGoalData(undefined, [], true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goal).toBeNull();
    expect(result.current.contributions).toEqual([]);
    expect(result.current.recurringContributions).toEqual([]);
  });

  it('returns early when goal is not found (lines 32-33)', async () => {
    const { result } = renderHook(() => useGoalData('999', [mockGoal], true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goal).toBeNull();
  });

  it('sets goal for unauthenticated user', async () => {
    const { result } = renderHook(() => useGoalData('1', [mockGoal], false));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goal).toEqual(mockGoal);
    expect(result.current.contributions).toEqual([]);
    expect(result.current.recurringContributions).toEqual([]);
  });

  it('sets goal for authenticated user with string id', async () => {
    const guestGoal = { ...mockGoal, id: 'local_123' };
    const { result } = renderHook(() => useGoalData('local_123', [guestGoal], true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goal).toEqual(guestGoal);
  });

  it('fetches authenticated goal data successfully', async () => {
    mockedApi.getGoal.mockResolvedValue({ data: { goal: mockGoal } });
    mockedApi.getContributions.mockResolvedValue({ data: { contributions: [mockContribution] } });
    mockedApi.getRecurringContributions.mockResolvedValue({
      data: { recurring_contributions: [mockRecurringContribution] },
    });

    const { result } = renderHook(() => useGoalData('1', [mockGoal], true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goal).toEqual(mockGoal);
    expect(result.current.contributions).toEqual([mockContribution]);
    expect(result.current.recurringContributions).toEqual([mockRecurringContribution]);
  });

  it('uses fallback goal when API returns no goal data', async () => {
    // @ts-expect-error - Testing edge case where API returns empty data object
    mockedApi.getGoal.mockResolvedValue({ data: {} });
    // @ts-expect-error - Testing edge case where API returns empty data object
    mockedApi.getContributions.mockResolvedValue({ data: {} });
    // @ts-expect-error - Testing edge case where API returns empty data object
    mockedApi.getRecurringContributions.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useGoalData('1', [mockGoal], true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goal).toEqual(mockGoal);
    expect(result.current.contributions).toEqual([]);
    expect(result.current.recurringContributions).toEqual([]);
  });

  it('handles API error and uses fallback goal (line 63)', async () => {
    mockedApi.getGoal.mockRejectedValue(new Error('Network error'));
    mockedApi.getContributions.mockRejectedValue(new Error('Network error'));
    mockedApi.getRecurringContributions.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGoalData('1', [mockGoal], true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.goal).toEqual(mockGoal);
    expect(result.current.contributions).toEqual([]);
    expect(result.current.recurringContributions).toEqual([]);
  });

  it('refreshGoalData refetches data', async () => {
    mockedApi.getGoal.mockResolvedValue({ data: { goal: mockGoal } });
    mockedApi.getContributions.mockResolvedValue({ data: { contributions: [mockContribution] } });
    mockedApi.getRecurringContributions.mockResolvedValue({
      data: { recurring_contributions: [mockRecurringContribution] },
    });

    const { result } = renderHook(() => useGoalData('1', [mockGoal], true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change mock data
    const newContribution: Contribution = { ...mockContribution, id: 2, amount: 200 };
    mockedApi.getContributions.mockResolvedValue({ data: { contributions: [mockContribution, newContribution] } });

    // Call refresh
    await result.current.refreshGoalData();

    await waitFor(() => {
      expect(result.current.contributions).toHaveLength(2);
    });

    expect(result.current.contributions).toContainEqual(newContribution);
  });

  it('updates when dependencies change', async () => {
    mockedApi.getGoal.mockResolvedValue({ data: { goal: mockGoal } });
    mockedApi.getContributions.mockResolvedValue({ data: { contributions: [] } });
    mockedApi.getRecurringContributions.mockResolvedValue({ data: { recurring_contributions: [] } });

    const { result, rerender } = renderHook(
      ({ goalId, goals, isAuthenticated }) => useGoalData(goalId, goals, isAuthenticated),
      { initialProps: { goalId: '1', goals: [mockGoal], isAuthenticated: true } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.getGoal).toHaveBeenCalledTimes(1);

    // Change goalId
    rerender({ goalId: '1', goals: [mockGoal], isAuthenticated: false });

    await waitFor(() => {
      expect(result.current.goal).toEqual(mockGoal);
    });
  });
});
