import { useState } from 'react';
import { Goal, Contribution, ContributionInput } from '../types/goal';
import { api } from '../services/api';

interface UseContributionResult {
  amount: string;
  note: string;
  isWithdrawal: boolean;
  submitting: boolean;
  error: string | null;
  setAmount: (value: string) => void;
  setNote: (value: string) => void;
  setIsWithdrawal: (value: boolean) => void;
  handleSubmit: (
    goal: Goal,
    isAuthenticated: boolean,
    onSuccess: (contribution: Contribution, updatedGoal: Goal, newMilestones?: number[]) => void,
    updateGoalCallback?: (id: number | string, updates: Partial<Goal>) => Promise<Goal | null>
  ) => Promise<void>;
  resetForm: () => void;
}

const VALIDATION_MESSAGES = {
  INVALID_AMOUNT: 'Please enter a valid amount',
} as const;

/**
 * Custom hook for managing contribution form state and submission
 * @returns Contribution form state and handlers
 */
export function useContribution(): UseContributionResult {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isWithdrawal, setIsWithdrawal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setAmount('');
    setNote('');
    setError(null);
  };

  const validateAmount = (amountStr: string): number | null => {
    const parsedAmount = parseFloat(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(VALIDATION_MESSAGES.INVALID_AMOUNT);
      return null;
    }

    return parsedAmount;
  };

  const handleAuthenticatedSubmit = async (
    goal: Goal,
    finalAmount: number,
    onSuccess: (contribution: Contribution, updatedGoal: Goal, newMilestones?: number[]) => void
  ) => {
    if (typeof goal.id !== 'number') return;

    const input: ContributionInput = {
      amount: finalAmount,
      note: note || undefined,
      contributed_at: new Date().toISOString(),
    };

    const response = await api.createContribution(goal.id, input);

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      onSuccess(response.data.contribution, response.data.goal, response.data.new_milestones);
      resetForm();
    }
  };

  const handleGuestSubmit = async (
    goal: Goal,
    finalAmount: number,
    onSuccess: (contribution: Contribution, updatedGoal: Goal) => void,
    updateGoalCallback?: (id: number | string, updates: Partial<Goal>) => Promise<Goal | null>
  ) => {
    if (!updateGoalCallback) return;

    const newAmount = goal.current_amount + finalAmount;
    const updated = await updateGoalCallback(goal.id, {
      current_amount: Math.max(0, newAmount),
    });

    if (updated) {
      // Create a mock contribution for guest mode
      const mockContribution: Contribution = {
        id: Date.now(),
        goal_id: goal.id as number,
        amount: finalAmount,
        note: note || undefined,
        contributed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onSuccess(mockContribution, updated);
      resetForm();
    }
  };

  const handleSubmit = async (
    goal: Goal,
    isAuthenticated: boolean,
    onSuccess: (contribution: Contribution, updatedGoal: Goal, newMilestones?: number[]) => void,
    updateGoalCallback?: (id: number | string, updates: Partial<Goal>) => Promise<Goal | null>
  ) => {
    if (!amount) return;

    const parsedAmount = validateAmount(amount);
    if (parsedAmount === null) return;

    const finalAmount = isWithdrawal ? -parsedAmount : parsedAmount;
    setSubmitting(true);
    setError(null);

    try {
      if (isAuthenticated) {
        await handleAuthenticatedSubmit(goal, finalAmount, onSuccess);
      } else {
        await handleGuestSubmit(goal, finalAmount, onSuccess, updateGoalCallback);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    amount,
    note,
    isWithdrawal,
    submitting,
    error,
    setAmount,
    setNote,
    setIsWithdrawal,
    handleSubmit,
    resetForm,
  };
}
