import { Grid } from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StatCard from './StatCard';
import { formatCurrency } from '../../utils/formatters';

interface StatsGridProps {
  totalSaved: number;
  totalTarget: number;
  activeCount: number;
  completedCount: number;
}

export default function StatsGrid({
  totalSaved,
  totalTarget,
  activeCount,
  completedCount,
}: StatsGridProps) {
  const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : '0.0';

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Saved"
          value={formatCurrency(totalSaved)}
          icon={<SavingsIcon fontSize="large" />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Progress"
          value={`${overallProgress}%`}
          subtitle={`of ${formatCurrency(totalTarget)}`}
          icon={<TrendingUpIcon fontSize="large" />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Active Goals"
          value={String(activeCount)}
          icon={<SavingsIcon fontSize="large" />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Completed"
          value={String(completedCount)}
          icon={<CheckCircleIcon fontSize="large" />}
        />
      </Grid>
    </Grid>
  );
}
