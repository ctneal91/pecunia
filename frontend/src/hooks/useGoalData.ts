import { useState, useEffect } from 'react';
import { Goal, Contribution, RecurringContribution } from '../types/goal';
import { api } from '../services/api';

interface UseGoalDataResult {
  goal: Goal | null;
  contributions: Contribution[];
  recurringContributions: RecurringContribution[];
  loading: boolean;
  refreshGoalData: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage goal data
 * @param goalId - The ID of the goal to fetch
 * @param goals - List of goals from context
 * @param isAuthenticated - Whether the user is logged in
 * @returns Goal data and loading state
 */
export function useGoalData(
  goalId: string | undefined,
  goals: Goal[],
  isAuthenticated: boolean
): UseGoalDataResult {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [recurringContributions, setRecurringContributions] = useState<RecurringContribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoalData = async () => {
    if (!goalId) {
      setLoading(false);
      return;
    }

    const foundGoal = goals.find((g) => String(g.id) === goalId);

    if (!foundGoal) {
      setLoading(false);
      return;
    }

    if (isAuthenticated && typeof foundGoal.id === 'number') {
      await fetchAuthenticatedGoalData(foundGoal.id, foundGoal);
    } else {
      setGoal(foundGoal);
      setLoading(false);
    }
  };

  const fetchAuthenticatedGoalData = async (goalNumericId: number, fallbackGoal: Goal) => {
    try {
      const [goalResponse, contributionsResponse, recurringResponse] = await Promise.all([
        api.getGoal(goalNumericId),
        api.getContributions(goalNumericId),
        api.getRecurringContributions(goalNumericId),
      ]);

      setGoal(goalResponse.data?.goal || fallbackGoal);
      setContributions(contributionsResponse.data?.contributions || []);
      setRecurringContributions(recurringResponse.data?.recurring_contributions || []);
    } catch (error) {
      setGoal(fallbackGoal);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalData();
  }, [goalId, goals, isAuthenticated]);

  return {
    goal,
    contributions,
    recurringContributions,
    loading,
    refreshGoalData: fetchGoalData,
  };
}
