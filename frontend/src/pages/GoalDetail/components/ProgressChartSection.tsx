import { Paper, Typography } from '@mui/material';
import ProgressChart from '../../../components/ProgressChart';
import { Contribution, Milestone } from '../../../types/goal';
import { SPACING } from '../../../constants/ui';

interface ProgressChartSectionProps {
  contributions: Contribution[];
  milestones?: Milestone[];
  targetAmount: number;
  currentAmount: number;
}

export default function ProgressChartSection({
  contributions,
  milestones,
  targetAmount,
  currentAmount,
}: ProgressChartSectionProps) {
  if (contributions.length === 0) return null;

  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
      <Typography variant="h6" gutterBottom>
        Progress Over Time
      </Typography>
      <ProgressChart
        contributions={contributions}
        milestones={milestones}
        targetAmount={targetAmount}
        currentAmount={currentAmount}
      />
    </Paper>
  );
}
