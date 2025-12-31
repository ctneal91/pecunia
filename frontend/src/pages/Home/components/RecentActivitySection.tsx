import { Paper, Typography } from '@mui/material';
import { RecentContribution } from '../../../services/api';
import { RecentActivityList } from '../../../components/Home';

interface RecentActivitySectionProps {
  contributions: RecentContribution[];
}

export default function RecentActivitySection({ contributions }: RecentActivitySectionProps) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <RecentActivityList contributions={contributions} />
    </Paper>
  );
}
