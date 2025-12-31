import { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Contribution, Milestone } from '../../types/goal';
import { formatCurrency } from '../../utils/formatters';

interface ProgressChartProps {
  contributions: Contribution[];
  milestones?: Milestone[];
  targetAmount: number;
  currentAmount: number;
}

interface ChartDataPoint {
  date: string;
  amount: number;
  cumulative: number;
}

function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function ProgressChart({
  contributions,
  milestones,
  targetAmount,
  currentAmount,
}: ProgressChartProps) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (contributions.length === 0) return [];

    const sorted = [...contributions].sort(
      (a, b) => new Date(a.contributed_at).getTime() - new Date(b.contributed_at).getTime()
    );

    const dailyData = new Map<string, number>();

    sorted.forEach((contribution) => {
      const date = new Date(contribution.contributed_at).toISOString().split('T')[0];
      const existing = dailyData.get(date) || 0;
      dailyData.set(date, existing + contribution.amount);
    });

    let cumulative = 0;
    const data: ChartDataPoint[] = [];

    Array.from(dailyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, amount]) => {
        cumulative += amount;
        data.push({
          date,
          amount,
          cumulative: Math.max(0, cumulative),
        });
      });

    return data;
  }, [contributions]);

  const milestoneLines = useMemo(() => {
    if (!milestones || milestones.length === 0) return [];
    return milestones.map((m) => ({
      percentage: m.percentage,
      value: (targetAmount * m.percentage) / 100,
      achievedAt: m.achieved_at,
    }));
  }, [milestones, targetAmount]);

  if (contributions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No contributions yet. Add your first contribution to see progress over time.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            stroke={theme.palette.divider}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            stroke={theme.palette.divider}
            domain={[0, Math.max(targetAmount, currentAmount) * 1.1]}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(value as number), 'Total Saved']}
            labelFormatter={(label) => formatDateShort(label as string)}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <ReferenceLine
            y={targetAmount}
            stroke={theme.palette.success.main}
            strokeDasharray="5 5"
            label={{
              value: 'Goal',
              position: 'right',
              fill: theme.palette.success.main,
              fontSize: 12,
            }}
          />
          {milestoneLines.map((milestone) => (
            <ReferenceLine
              key={milestone.percentage}
              y={milestone.value}
              stroke={theme.palette.warning.light}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            fill="url(#progressGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
