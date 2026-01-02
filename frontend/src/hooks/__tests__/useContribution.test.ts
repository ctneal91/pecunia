import { renderHook, act } from '@testing-library/react';
import { useContribution } from '../useContribution';
import { api } from '../../services/api';
import { Goal, Contribution } from '../../types/goal';

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

describe('useContribution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useContribution());

    expect(result.current.amount).toBe('');
    expect(result.current.note).toBe('');
    expect(result.current.isWithdrawal).toBe(false);
    expect(result.current.submitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('updates amount state', () => {
    const { result } = renderHook(() => useContribution());

    act(() => {
      result.current.setAmount('100');
    });

    expect(result.current.amount).toBe('100');
  });

  it('updates note state', () => {
    const { result } = renderHook(() => useContribution());

    act(() => {
      result.current.setNote('Test note');
    });

    expect(result.current.note).toBe('Test note');
  });

  it('updates isWithdrawal state', () => {
    const { result } = renderHook(() => useContribution());

    act(() => {
      result.current.setIsWithdrawal(true);
    });

    expect(result.current.isWithdrawal).toBe(true);
  });

  describe('resetForm (lines 38-42)', () => {
    it('resets form state (lines 39-41)', () => {
      const { result } = renderHook(() => useContribution());

      act(() => {
        result.current.setAmount('100');
        result.current.setNote('Test note');
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.amount).toBe('');
      expect(result.current.note).toBe('');
      expect(result.current.error).toBeNull();
    });
  });

  describe('validateAmount (lines 44-53)', () => {
    it('sets error for invalid amount (lines 47-49)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      act(() => {
        result.current.setAmount('invalid');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(result.current.error).toBe('Please enter a valid amount');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('sets error for zero amount (lines 47-49)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      act(() => {
        result.current.setAmount('0');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(result.current.error).toBe('Please enter a valid amount');
    });

    it('sets error for negative amount (lines 47-49)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      act(() => {
        result.current.setAmount('-100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(result.current.error).toBe('Please enter a valid amount');
    });

    it('returns parsed amount for valid input (line 52)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({
        data: {
          contribution: mockContribution,
          goal: mockGoal,
        },
      });

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(result.current.error).toBeNull();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('handleAuthenticatedSubmit (lines 55-76)', () => {
    it('returns early for non-numeric goal id (line 60)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();
      const guestGoal = { ...mockGoal, id: 'local_123' };

      mockedApi.createContribution.mockResolvedValue({
        data: {
          contribution: mockContribution,
          goal: mockGoal,
        },
      });

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(guestGoal, true, onSuccess);
      });

      expect(mockedApi.createContribution).not.toHaveBeenCalled();
    });

    it('creates contribution with note (lines 62-66)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({
        data: {
          contribution: mockContribution,
          goal: mockGoal,
        },
      });

      act(() => {
        result.current.setAmount('100');
        result.current.setNote('Test note');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(mockedApi.createContribution).toHaveBeenCalledWith(1, {
        amount: 100,
        note: 'Test note',
        contributed_at: expect.any(String),
      });
    });

    it('creates contribution without note when empty (lines 62-66)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({
        data: {
          contribution: mockContribution,
          goal: mockGoal,
        },
      });

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(mockedApi.createContribution).toHaveBeenCalledWith(1, {
        amount: 100,
        note: undefined,
        contributed_at: expect.any(String),
      });
    });

    it('handles API error (lines 70-71)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({
        error: 'Failed to create contribution',
      });

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(result.current.error).toBe('Failed to create contribution');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls onSuccess with milestones (lines 72-74)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({
        data: {
          contribution: mockContribution,
          goal: mockGoal,
          new_milestones: [25, 50],
        },
      });

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith(mockContribution, mockGoal, [25, 50]);
    });

    it('handles response without data or error (line 72)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({});

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });
  });

  describe('handleGuestSubmit (lines 78-106)', () => {
    it('returns early when updateGoalCallback is undefined (line 84)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, false, onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('updates goal with new amount (lines 86-89)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();
      const updateGoalCallback = jest.fn().mockResolvedValue(mockGoal);

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, false, onSuccess, updateGoalCallback);
      });

      expect(updateGoalCallback).toHaveBeenCalledWith(1, {
        current_amount: 2600, // 2500 + 100
      });
    });

    it('creates mock contribution for guest mode (lines 91-104)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();
      const updateGoalCallback = jest.fn().mockResolvedValue(mockGoal);

      act(() => {
        result.current.setAmount('100');
        result.current.setNote('Guest contribution');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, false, onSuccess, updateGoalCallback);
      });

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          goal_id: 1,
          user_id: null,
          amount: 100,
          note: 'Guest contribution',
        }),
        mockGoal
      );
    });

    it('handles withdrawal with Math.max for negative result (line 88)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();
      const updateGoalCallback = jest.fn().mockResolvedValue(mockGoal);

      act(() => {
        result.current.setAmount('3000');
        result.current.setIsWithdrawal(true);
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, false, onSuccess, updateGoalCallback);
      });

      // 2500 - 3000 = -500, but Math.max(0, -500) = 0
      expect(updateGoalCallback).toHaveBeenCalledWith(1, {
        current_amount: 0,
      });
    });

    it('handles when updateGoalCallback returns null (line 91)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();
      const updateGoalCallback = jest.fn().mockResolvedValue(null);

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, false, onSuccess, updateGoalCallback);
      });

      expect(updateGoalCallback).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit (lines 108-132)', () => {
    it('returns early when amount is empty (line 114)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('handles withdrawal by negating amount (line 119)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({
        data: {
          contribution: { ...mockContribution, amount: -100 },
          goal: mockGoal,
        },
      });

      act(() => {
        result.current.setAmount('100');
        result.current.setIsWithdrawal(true);
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(mockedApi.createContribution).toHaveBeenCalledWith(1, {
        amount: -100,
        note: undefined,
        contributed_at: expect.any(String),
      });
    });

    it('sets submitting to false after submission (line 130)', async () => {
      const { result } = renderHook(() => useContribution());
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({
        data: {
          contribution: mockContribution,
          goal: mockGoal,
        },
      });

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      // Check submitting is false after completion
      expect(result.current.submitting).toBe(false);
    });

    it('clears error before submission (line 121)', async () => {
      const onSuccess = jest.fn();

      // First, create an error
      mockedApi.createContribution.mockResolvedValueOnce({
        error: 'First error',
      });

      const { result } = renderHook(() => useContribution());

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(result.current.error).toBe('First error');

      // Second submission should clear error
      mockedApi.createContribution.mockResolvedValueOnce({
        data: {
          contribution: mockContribution,
          goal: mockGoal,
        },
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(result.current.error).toBeNull();
    });

    it('routes to authenticated submit when authenticated (lines 124-125)', async () => {
      const onSuccess = jest.fn();

      mockedApi.createContribution.mockResolvedValue({
        data: {
          contribution: mockContribution,
          goal: mockGoal,
        },
      });

      const { result } = renderHook(() => useContribution());

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, true, onSuccess);
      });

      expect(mockedApi.createContribution).toHaveBeenCalled();
    });

    it('routes to guest submit when not authenticated (lines 126-127)', async () => {
      const onSuccess = jest.fn();
      const updateGoalCallback = jest.fn().mockResolvedValue(mockGoal);

      const { result } = renderHook(() => useContribution());

      act(() => {
        result.current.setAmount('100');
      });

      await act(async () => {
        await result.current.handleSubmit(mockGoal, false, onSuccess, updateGoalCallback);
      });

      expect(updateGoalCallback).toHaveBeenCalled();
      expect(mockedApi.createContribution).not.toHaveBeenCalled();
    });
  });
});
