import { Contribution } from '../../../types/goal';
import {
  calculateDaysSinceFirst,
  calculateSavingsRates,
  determineContributionFrequency,
  calculateEstimatedCompletion,
  calculateTargetDateRequirements,
} from './contributionCalculations';

export interface ProjectionStats {
  averageMonthlyRate: number;
  averageWeeklyRate: number;
  estimatedCompletionDate: Date | null;
  daysToComplete: number | null;
  requiredMonthlyForTarget: number | null;
  isOnTrack: boolean | null;
  contributionFrequency: string;
  totalContributions: number;
  daysSinceFirstContribution: number;
}

const EMPTY_STATS: ProjectionStats = {
  averageMonthlyRate: 0,
  averageWeeklyRate: 0,
  estimatedCompletionDate: null,
  daysToComplete: null,
  requiredMonthlyForTarget: null,
  isOnTrack: null,
  contributionFrequency: 'N/A',
  totalContributions: 0,
  daysSinceFirstContribution: 0,
};

export function calculateProjectionStats(
  contributions: Contribution[],
  targetAmount: number,
  currentAmount: number,
  targetDate?: string | null
): ProjectionStats {
  const remainingAmount = Math.max(0, targetAmount - currentAmount);

  // Filter positive contributions only for rate calculation
  const positiveContributions = contributions.filter(c => c.amount > 0);
  const totalContributions = positiveContributions.length;

  if (totalContributions === 0) {
    return EMPTY_STATS;
  }

  // Sort contributions by date
  const sorted = [...positiveContributions].sort(
    (a, b) => new Date(a.contributed_at).getTime() - new Date(b.contributed_at).getTime()
  );

  const firstContributionDate = new Date(sorted[0].contributed_at);
  const lastContributionDate = new Date(sorted[sorted.length - 1].contributed_at);
  const daysSinceFirst = calculateDaysSinceFirst(firstContributionDate);

  // Calculate total positive contributions
  const totalPositiveAmount = positiveContributions.reduce((sum, c) => sum + c.amount, 0);

  // Calculate rates
  const { dailyRate, weeklyRate, monthlyRate } = calculateSavingsRates(
    totalPositiveAmount,
    daysSinceFirst
  );

  // Calculate contribution frequency
  const contributionFrequency = determineContributionFrequency(
    positiveContributions,
    firstContributionDate,
    lastContributionDate
  );

  // Calculate estimated completion
  const { estimatedCompletionDate, daysToComplete } = calculateEstimatedCompletion(
    dailyRate,
    remainingAmount
  );

  // Calculate target date requirements
  const { requiredMonthlyForTarget, isOnTrack } = targetDate
    ? calculateTargetDateRequirements(targetDate, remainingAmount, dailyRate)
    : { requiredMonthlyForTarget: null, isOnTrack: null };

  return {
    averageMonthlyRate: monthlyRate,
    averageWeeklyRate: weeklyRate,
    estimatedCompletionDate,
    daysToComplete,
    requiredMonthlyForTarget,
    isOnTrack,
    contributionFrequency,
    totalContributions,
    daysSinceFirstContribution: daysSinceFirst,
  };
}
