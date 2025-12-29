import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Goal, GoalInput } from '../types/goal';
import { goalStorage } from '../services/goalStorage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  createGoal: (input: GoalInput) => Promise<Goal | null>;
  updateGoal: (id: number | string, input: Partial<GoalInput>) => Promise<Goal | null>;
  deleteGoal: (id: number | string) => Promise<boolean>;
  refreshGoals: () => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (user) {
      const response = await api.getGoals();
      if (response.error) {
        setError(response.error);
        setGoals([]);
      } else {
        setGoals(response.data?.goals || []);
      }
    } else {
      setGoals(goalStorage.getAll());
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const createGoal = useCallback(async (input: GoalInput): Promise<Goal | null> => {
    if (user) {
      const response = await api.createGoal(input);
      if (response.error) {
        setError(response.error);
        return null;
      }
      const newGoal = response.data!.goal;
      setGoals((prev) => [newGoal, ...prev]);
      return newGoal;
    } else {
      const newGoal = goalStorage.create(input);
      setGoals((prev) => [newGoal, ...prev]);
      return newGoal;
    }
  }, [user]);

  const updateGoal = useCallback(async (id: number | string, input: Partial<GoalInput>): Promise<Goal | null> => {
    if (user) {
      const response = await api.updateGoal(id as number, input);
      if (response.error) {
        setError(response.error);
        return null;
      }
      const updatedGoal = response.data!.goal;
      setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
      return updatedGoal;
    } else {
      const updatedGoal = goalStorage.update(id, input);
      if (updatedGoal) {
        setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
      }
      return updatedGoal;
    }
  }, [user]);

  const deleteGoal = useCallback(async (id: number | string): Promise<boolean> => {
    if (user) {
      const response = await api.deleteGoal(id as number);
      if (response.error) {
        setError(response.error);
        return false;
      }
      setGoals((prev) => prev.filter((g) => g.id !== id));
      return true;
    } else {
      const success = goalStorage.delete(id);
      if (success) {
        setGoals((prev) => prev.filter((g) => g.id !== id));
      }
      return success;
    }
  }, [user]);

  const refreshGoals = useCallback(async () => {
    await loadGoals();
  }, [loadGoals]);

  const value = {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshGoals,
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}
