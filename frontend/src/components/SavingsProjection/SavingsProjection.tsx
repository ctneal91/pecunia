import { useMemo } from 'react';
import { Box, Divider } from '@mui/material';
import { Contribution } from '../../types/goal';
import SavingsRateCards from './SavingsRateCards';
import EstimatedCompletion from './EstimatedCompletion';
import TargetDateAnalysis from './TargetDateAnalysis';
import StatsSummary from './StatsSummary';
import EmptyState from './EmptyState';

interface SavingsProjectionProps {
  contributions: Contribution[];
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
}

interface ProjectionStats {
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

function calculateProjectionStats(
  contributions: Contribution[],
  targetAmount: number,
  currentAmount: number,
  targetDate?: string | null
): ProjectionStats {
  const now = new Date();
  const remainingAmount = Math.max(0, targetAmount - currentAmount);

  // Filter positive contributions only for rate calculation
  const positiveContributions = contributions.filter(c => c.amount > 0);
  const totalContributions = positiveContributions.length;

  if (totalContributions === 0) {
    return {
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
  }

  // Sort contributions by date
  const sorted = [...positiveContributions].sort(
    (a, b) => new Date(a.contributed_at).getTime() - new Date(b.contributed_at).getTime()
  );

  const firstContributionDate = new Date(sorted[0].contributed_at);
  const lastContributionDate = new Date(sorted[sorted.length - 1].contributed_at);

  const daysSinceFirst = Math.max(1, Math.ceil(
    (now.getTime() - firstContributionDate.getTime()) / (1000 * 60 * 60 * 24)
  ));

  // Calculate total positive contributions
  const totalPositiveAmount = positiveContributions.reduce((sum, c) => sum + c.amount, 0);

  // Calculate rates
  const dailyRate = totalPositiveAmount / daysSinceFirst;
  const averageWeeklyRate = dailyRate * 7;
  const averageMonthlyRate = dailyRate * 30;

  // Calculate contribution frequency
  let contributionFrequency = 'N/A';
  if (totalContributions > 1) {
    const daysBetween = Math.ceil(
      (lastContributionDate.getTime() - firstContributionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgDaysBetweenContributions = daysBetween / (totalContributions - 1);

    if (avgDaysBetweenContributions <= 1) {
      contributionFrequency = 'Daily';
    } else if (avgDaysBetweenContributions <= 7) {
      contributionFrequency = 'Weekly';
    } else if (avgDaysBetweenContributions <= 14) {
      contributionFrequency = 'Bi-weekly';
    } else if (avgDaysBetweenContributions <= 31) {
      contributionFrequency = 'Monthly';
    } else {
      contributionFrequency = 'Occasional';
    }
  } else {
    contributionFrequency = 'Just started';
  }

  // Calculate estimated completion date
  let estimatedCompletionDate: Date | null = null;
  let daysToComplete: number | null = null;

  if (dailyRate > 0 && remainingAmount > 0) {
    daysToComplete = Math.ceil(remainingAmount / dailyRate);
    estimatedCompletionDate = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
  } else if (remainingAmount <= 0) {
    estimatedCompletionDate = now;
    daysToComplete = 0;
  }

  // Calculate required monthly contribution for target date
  let requiredMonthlyForTarget: number | null = null;
  let isOnTrack: boolean | null = null;

  if (targetDate && remainingAmount > 0) {
    const targetDateObj = new Date(targetDate);
    const daysUntilTarget = Math.ceil(
      (targetDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilTarget > 0) {
      const requiredDailyRate = remainingAmount / daysUntilTarget;
      requiredMonthlyForTarget = requiredDailyRate * 30;
      isOnTrack = dailyRate >= requiredDailyRate;
    } else {
      requiredMonthlyForTarget = remainingAmount;
      isOnTrack = false;
    }
  }

  return {
    averageMonthlyRate,
    averageWeeklyRate,
    estimatedCompletionDate,
    daysToComplete,
    requiredMonthlyForTarget,
    isOnTrack,
    contributionFrequency,
    totalContributions,
    daysSinceFirstContribution: daysSinceFirst,
  };
}

export default function SavingsProjection({
  contributions,
  targetAmount,
  currentAmount,
  targetDate,
}: SavingsProjectionProps) {
  const stats = useMemo(
    () => calculateProjectionStats(contributions, targetAmount, currentAmount, targetDate),
    [contributions, targetAmount, currentAmount, targetDate]
  );

  const isGoalComplete = currentAmount >= targetAmount;

  if (contributions.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box>
      <SavingsRateCards
        averageMonthlyRate={stats.averageMonthlyRate}
        contributionFrequency={stats.contributionFrequency}
      />

      <Divider sx={{ my: 2 }} />

      <EstimatedCompletion
        isGoalComplete={isGoalComplete}
        estimatedCompletionDate={stats.estimatedCompletionDate}
        daysToComplete={stats.daysToComplete}
      />

      {targetDate && !isGoalComplete && (
        <TargetDateAnalysis
          targetDate={targetDate}
          isOnTrack={stats.isOnTrack}
          requiredMonthlyForTarget={stats.requiredMonthlyForTarget}
          averageMonthlyRate={stats.averageMonthlyRate}
        />
      )}

      <StatsSummary
        totalContributions={stats.totalContributions}
        daysSinceFirstContribution={stats.daysSinceFirstContribution}
        averageWeeklyRate={stats.averageWeeklyRate}
      />
    </Box>
  );
}
