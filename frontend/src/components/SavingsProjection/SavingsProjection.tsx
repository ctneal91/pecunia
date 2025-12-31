import { useMemo } from 'react';
import { Box, Divider } from '@mui/material';
import { Contribution } from '../../types/goal';
import SavingsRateCards from './SavingsRateCards';
import EstimatedCompletion from './EstimatedCompletion';
import TargetDateAnalysis from './TargetDateAnalysis';
import StatsSummary from './StatsSummary';
import EmptyState from './EmptyState';
import { calculateProjectionStats } from './utils';

interface SavingsProjectionProps {
  contributions: Contribution[];
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
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
