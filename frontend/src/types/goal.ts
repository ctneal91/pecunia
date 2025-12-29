export type GoalType =
  | 'emergency_fund'
  | 'savings'
  | 'debt_payoff'
  | 'retirement'
  | 'vacation'
  | 'home'
  | 'other';

export interface Goal {
  id: number | string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  goal_type: GoalType;
  target_date: string | null;
  icon: string | null;
  color: string | null;
  progress_percentage: number;
  remaining_amount: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  target_amount: number;
  current_amount?: number;
  goal_type: GoalType;
  target_date?: string;
  icon?: string;
  color?: string;
}

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  emergency_fund: 'Emergency Fund',
  savings: 'Savings',
  debt_payoff: 'Debt Payoff',
  retirement: 'Retirement',
  vacation: 'Vacation',
  home: 'Home',
  other: 'Other',
};

export const GOAL_TYPE_ICONS: Record<GoalType, string> = {
  emergency_fund: '🛡️',
  savings: '💰',
  debt_payoff: '💳',
  retirement: '🏖️',
  vacation: '✈️',
  home: '🏠',
  other: '🎯',
};

export const GOAL_TYPE_COLORS: Record<GoalType, string> = {
  emergency_fund: '#4CAF50',
  savings: '#2196F3',
  debt_payoff: '#FF5722',
  retirement: '#9C27B0',
  vacation: '#00BCD4',
  home: '#795548',
  other: '#607D8B',
};

export interface Contribution {
  id: number | string;
  goal_id: number | string;
  user_id: number | null;
  amount: number;
  note: string | null;
  contributed_at: string;
  created_at: string;
}

export interface ContributionInput {
  amount: number;
  note?: string;
  contributed_at: string;
}
