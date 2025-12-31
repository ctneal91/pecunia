import { Paper, Typography } from '@mui/material';
import SavingsProjection from '../../../components/SavingsProjection';
import { Contribution } from '../../../types/goal';
import { SPACING } from '../../../constants/ui';

interface SavingsProjectionSectionProps {
  contributions: Contribution[];
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
}

export default function SavingsProjectionSection({
  contributions,
  targetAmount,
  currentAmount,
  targetDate,
}: SavingsProjectionSectionProps) {
  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
      <Typography variant="h6" gutterBottom>
        Savings Projection
      </Typography>
      <SavingsProjection
        contributions={contributions}
        targetAmount={targetAmount}
        currentAmount={currentAmount}
        targetDate={targetDate}
      />
    </Paper>
  );
}
