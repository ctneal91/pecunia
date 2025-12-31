import { useMemo } from 'react';
import { Box, Typography, Paper, Divider, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SavingsIcon from '@mui/icons-material/Savings';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Contribution } from '../../types/goal';
import { formatCurrency, formatDate } from '../../utils/formatters';

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
  const theme = useTheme();

  const stats = useMemo(
    () => calculateProjectionStats(contributions, targetAmount, currentAmount, targetDate),
    [contributions, targetAmount, currentAmount, targetDate]
  );

  const isGoalComplete = currentAmount >= targetAmount;

  if (contributions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Add contributions to see savings projections and estimated completion date.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Savings Rate Section */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 140,
            p: 2,
            bgcolor: theme.palette.primary.main + '10',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon fontSize="small" color="primary" />
            <Typography variant="caption" color="text.secondary">
              Monthly Rate
            </Typography>
          </Box>
          <Typography variant="h6" color="primary.main">
            {formatCurrency(stats.averageMonthlyRate)}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 140,
            p: 2,
            bgcolor: theme.palette.info.main + '10',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SavingsIcon fontSize="small" color="info" />
            <Typography variant="caption" color="text.secondary">
              Frequency
            </Typography>
          </Box>
          <Typography variant="h6" color="info.main">
            {stats.contributionFrequency}
          </Typography>
        </Paper>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Estimated Completion */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarTodayIcon fontSize="small" color="action" />
          <Typography variant="subtitle2">
            Estimated Completion
          </Typography>
        </Box>

        {isGoalComplete ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            <Typography variant="body1" color="success.main" fontWeight="medium">
              Goal Complete!
            </Typography>
          </Box>
        ) : stats.estimatedCompletionDate ? (
          <Box>
            <Typography variant="h6">
              {formatDate(stats.estimatedCompletionDate)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.daysToComplete === 1
                ? '1 day remaining'
                : `${stats.daysToComplete} days remaining`}
              {' '}at current rate
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Unable to estimate - keep contributing!
          </Typography>
        )}
      </Box>

      {/* Target Date Analysis */}
      {targetDate && !isGoalComplete && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {stats.isOnTrack ? (
                <CheckCircleIcon fontSize="small" color="success" />
              ) : (
                <WarningIcon fontSize="small" color="warning" />
              )}
              <Typography variant="subtitle2">
                Target Date: {formatDate(new Date(targetDate))}
              </Typography>
            </Box>

            {stats.isOnTrack ? (
              <Typography variant="body2" color="success.main">
                You're on track to reach your goal before the target date!
              </Typography>
            ) : (
              <Box>
                <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
                  To reach your goal by the target date, you need to save:
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {formatCurrency(stats.requiredMonthlyForTarget || 0)}/month
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Currently saving {formatCurrency(stats.averageMonthlyRate)}/month)
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* Stats Summary */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {stats.totalContributions} contribution{stats.totalContributions !== 1 ? 's' : ''} over {stats.daysSinceFirstContribution} day{stats.daysSinceFirstContribution !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ~{formatCurrency(stats.averageWeeklyRate)}/week
        </Typography>
      </Box>
    </Box>
  );
}
