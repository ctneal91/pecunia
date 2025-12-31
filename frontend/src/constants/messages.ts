/**
 * User-facing messages and confirmation dialogs
 * Centralizes all user-facing text for consistency and i18n readiness
 */

export const CONFIRMATION_MESSAGES = {
  DELETE_CONTRIBUTION: 'Delete this contribution?',
  DELETE_GOAL: (goalTitle: string) => `Delete "${goalTitle}"? This cannot be undone.`,
  DELETE_RECURRING: 'Delete this recurring contribution?',
  DELETE_GROUP: (groupName: string) => `Delete "${groupName}"? This cannot be undone.`,
  LEAVE_GROUP: (groupName: string) => `Leave "${groupName}"?`,
  REMOVE_MEMBER: (memberName: string) => `Remove ${memberName} from this group?`,
} as const;

export const SUCCESS_MESSAGES = {
  GOAL_CREATED: 'Goal created successfully!',
  GOAL_UPDATED: 'Goal updated successfully!',
  CONTRIBUTION_ADDED: 'Contribution added!',
  RECURRING_CREATED: 'Recurring contribution created!',
} as const;

export const ERROR_MESSAGES = {
  GOAL_NOT_FOUND: 'Goal not found',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
} as const;

export const LOADING_MESSAGES = {
  LOADING: 'Loading...',
  EXPORTING: 'Exporting...',
  SUBMITTING: 'Submitting...',
  SAVING: 'Saving...',
} as const;
