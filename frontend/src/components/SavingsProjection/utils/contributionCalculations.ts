import { Contribution } from '../../../types/goal';

export function calculateDaysSinceFirst(firstContributionDate: Date): number {
  const now = new Date();
  return Math.max(
    1,
    Math.ceil((now.getTime() - firstContributionDate.getTime()) / (1000 * 60 * 60 * 24))
  );
}

export function calculateSavingsRates(totalAmount: number, daysSinceFirst: number) {
  const dailyRate = totalAmount / daysSinceFirst;
  return {
    dailyRate,
    weeklyRate: dailyRate * 7,
    monthlyRate: dailyRate * 30,
  };
}

export function determineContributionFrequency(
  contributions: Contribution[],
  firstContributionDate: Date,
  lastContributionDate: Date
): string {
  if (contributions.length <= 1) {
    return 'Just started';
  }

  const daysBetween = Math.ceil(
    (lastContributionDate.getTime() - firstContributionDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const avgDaysBetweenContributions = daysBetween / (contributions.length - 1);

  if (avgDaysBetweenContributions <= 1) return 'Daily';
  if (avgDaysBetweenContributions <= 7) return 'Weekly';
  if (avgDaysBetweenContributions <= 14) return 'Bi-weekly';
  if (avgDaysBetweenContributions <= 31) return 'Monthly';
  return 'Occasional';
}

export function calculateEstimatedCompletion(dailyRate: number, remainingAmount: number) {
  const now = new Date();

  if (remainingAmount <= 0) {
    return {
      estimatedCompletionDate: now,
      daysToComplete: 0,
    };
  }

  if (dailyRate > 0) {
    const daysToComplete = Math.ceil(remainingAmount / dailyRate);
    const estimatedCompletionDate = new Date(
      now.getTime() + daysToComplete * 24 * 60 * 60 * 1000
    );
    return {
      estimatedCompletionDate,
      daysToComplete,
    };
  }

  return {
    estimatedCompletionDate: null,
    daysToComplete: null,
  };
}

export function calculateTargetDateRequirements(
  targetDate: string,
  remainingAmount: number,
  dailyRate: number
) {
  if (remainingAmount <= 0) {
    return {
      requiredMonthlyForTarget: null,
      isOnTrack: null,
    };
  }

  const now = new Date();
  const targetDateObj = new Date(targetDate);
  const daysUntilTarget = Math.ceil(
    (targetDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilTarget > 0) {
    const requiredDailyRate = remainingAmount / daysUntilTarget;
    return {
      requiredMonthlyForTarget: requiredDailyRate * 30,
      isOnTrack: dailyRate >= requiredDailyRate,
    };
  }

  return {
    requiredMonthlyForTarget: remainingAmount,
    isOnTrack: false,
  };
}
