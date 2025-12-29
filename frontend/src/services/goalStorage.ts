import { Goal, GoalInput, GOAL_TYPE_COLORS } from '../types/goal';

const STORAGE_KEY = 'pecunia_guest_goals';

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateGoalFields(input: GoalInput): Partial<Goal> {
  const currentAmount = input.current_amount || 0;
  const targetAmount = input.target_amount;
  const progressPercentage = targetAmount > 0
    ? Math.round((currentAmount / targetAmount) * 1000) / 10
    : 0;

  return {
    progress_percentage: progressPercentage,
    remaining_amount: Math.max(targetAmount - currentAmount, 0),
    completed: currentAmount >= targetAmount,
  };
}

export const goalStorage = {
  getAll(): Goal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getById(id: string | number): Goal | null {
    const goals = this.getAll();
    return goals.find((g) => g.id === id) || null;
  },

  create(input: GoalInput): Goal {
    const goals = this.getAll();
    const now = new Date().toISOString();
    const calculatedFields = calculateGoalFields(input);

    const goal: Goal = {
      id: generateId(),
      title: input.title,
      description: input.description || null,
      target_amount: input.target_amount,
      current_amount: input.current_amount || 0,
      goal_type: input.goal_type,
      target_date: input.target_date || null,
      icon: input.icon || null,
      color: input.color || GOAL_TYPE_COLORS[input.goal_type],
      progress_percentage: calculatedFields.progress_percentage!,
      remaining_amount: calculatedFields.remaining_amount!,
      completed: calculatedFields.completed!,
      created_at: now,
      updated_at: now,
    };

    goals.unshift(goal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    return goal;
  },

  update(id: string | number, input: Partial<GoalInput>): Goal | null {
    const goals = this.getAll();
    const index = goals.findIndex((g) => g.id === id);

    if (index === -1) return null;

    const existing = goals[index];
    const updated: Goal = {
      ...existing,
      ...input,
      updated_at: new Date().toISOString(),
    };

    const calculatedFields = calculateGoalFields({
      title: updated.title,
      target_amount: updated.target_amount,
      current_amount: updated.current_amount,
      goal_type: updated.goal_type,
    });

    updated.progress_percentage = calculatedFields.progress_percentage!;
    updated.remaining_amount = calculatedFields.remaining_amount!;
    updated.completed = calculatedFields.completed!;

    goals[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    return updated;
  },

  delete(id: string | number): boolean {
    const goals = this.getAll();
    const filtered = goals.filter((g) => g.id !== id);

    if (filtered.length === goals.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  hasGoals(): boolean {
    return this.getAll().length > 0;
  },
};
