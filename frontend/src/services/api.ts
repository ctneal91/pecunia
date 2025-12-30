import { Goal, GoalInput, Contribution, ContributionInput } from '../types/goal';
import { Group, GroupWithMembers, GroupInput, Membership, GroupInvite, PendingInvite, InviteDetails } from '../types/group';

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
  } catch {
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
  new_milestones?: number[];
}

export interface DashboardStats {
  total_saved: number;
  total_target: number;
  overall_progress: number;
  goal_count: number;
  completed_count: number;
  active_count: number;
}

export interface RecentContribution {
  id: number;
  amount: number;
  note: string | null;
  contributed_at: string;
  goal: {
    id: number;
    title: string;
    goal_type: string;
  };
}

interface DashboardResponse {
  stats: DashboardStats;
  recent_contributions: RecentContribution[];
  goals_summary: Goal[];
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

  getDashboard: () => request<DashboardResponse>('/dashboard'),

  // Groups
  getGroups: () => request<{ groups: Group[] }>('/groups'),

  getGroup: (id: number) => request<{ group: GroupWithMembers }>(`/groups/${id}`),

  createGroup: (data: GroupInput) =>
    request<{ group: Group }>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGroup: (id: number, data: GroupInput) =>
    request<{ group: Group }>(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteGroup: (id: number) =>
    request<void>(`/groups/${id}`, {
      method: 'DELETE',
    }),

  joinGroup: (inviteCode: string) =>
    request<{ group: Group }>('/groups/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    }),

  regenerateInviteCode: (groupId: number) =>
    request<{ group: Group }>(`/groups/${groupId}/regenerate_invite`, {
      method: 'POST',
    }),

  leaveGroup: (groupId: number) =>
    request<void>(`/groups/${groupId}/memberships/leave`, {
      method: 'DELETE',
    }),

  updateMembership: (groupId: number, membershipId: number, role: 'admin' | 'member') =>
    request<{ membership: Membership }>(`/groups/${groupId}/memberships/${membershipId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  removeMember: (groupId: number, membershipId: number) =>
    request<void>(`/groups/${groupId}/memberships/${membershipId}`, {
      method: 'DELETE',
    }),

  // Group Invites
  getGroupInvites: (groupId: number) =>
    request<{ invites: GroupInvite[] }>(`/groups/${groupId}/invites`),

  sendInvite: (groupId: number, email: string) =>
    request<{ invite: GroupInvite }>(`/groups/${groupId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resendInvite: (groupId: number, inviteId: number) =>
    request<{ invite: GroupInvite; message: string }>(`/groups/${groupId}/invites/${inviteId}/resend`, {
      method: 'POST',
    }),

  getInviteDetails: (token: string) =>
    request<{ invite: InviteDetails }>(`/invites/${token}`),

  acceptInvite: (token: string) =>
    request<{ group: Group }>(`/invites/${token}/accept`, {
      method: 'POST',
    }),

  declineInvite: (token: string) =>
    request<{ message: string }>(`/invites/${token}/decline`, {
      method: 'POST',
    }),

  getPendingInvites: () =>
    request<{ invites: PendingInvite[] }>('/invites/pending'),
};
