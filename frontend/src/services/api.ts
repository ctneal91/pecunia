import { Goal, GoalInput, Contribution, ContributionInput } from '../types/goal';

const API_BASE = '/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  errors?: string[];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || data.errors?.join(', ') || 'Request failed',
        errors: data.errors,
      };
    }

    return { data };
  } catch (err) {
    return { error: 'Network error' };
  }
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

interface AuthResponse {
  user: User;
}

interface MeResponse {
  user: User | null;
}

interface GoalsResponse {
  goals: Goal[];
}

interface GoalResponse {
  goal: Goal;
}

interface ContributionsResponse {
  contributions: Contribution[];
}

interface ContributionResponse {
  contribution: Contribution;
  goal: Goal;
}

export const api = {
  signup: (email: string, password: string, passwordConfirmation: string, name?: string) =>
    request<AuthResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        password_confirmation: passwordConfirmation,
        name,
      }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<void>('/logout', {
      method: 'DELETE',
    }),

  getMe: () => request<MeResponse>('/me'),

  updateProfile: (data: { name?: string; avatar_url?: string; password?: string; password_confirmation?: string }) =>
    request<AuthResponse>('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getGoals: () => request<GoalsResponse>('/goals'),

  getGoal: (id: number) => request<GoalResponse>(`/goals/${id}`),

  createGoal: (data: GoalInput) =>
    request<GoalResponse>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGoal: (id: number, data: Partial<GoalInput>) =>
    request<GoalResponse>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteGoal: (id: number) =>
    request<void>(`/goals/${id}`, {
      method: 'DELETE',
    }),

  bulkCreateGoals: (goals: GoalInput[]) =>
    request<GoalsResponse>('/goals/bulk_create', {
      method: 'POST',
      body: JSON.stringify({ goals }),
    }),

  getContributions: (goalId: number) =>
    request<ContributionsResponse>(`/goals/${goalId}/contributions`),

  createContribution: (goalId: number, data: ContributionInput) =>
    request<ContributionResponse>(`/goals/${goalId}/contributions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateContribution: (goalId: number, contributionId: number, data: Partial<ContributionInput>) =>
    request<ContributionResponse>(`/goals/${goalId}/contributions/${contributionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteContribution: (goalId: number, contributionId: number) =>
    request<{ goal: Goal }>(`/goals/${goalId}/contributions/${contributionId}`, {
      method: 'DELETE',
    }),
};
