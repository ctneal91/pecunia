import { Paper, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface EmptyStateProps {
  onCreateGoal: () => void;
}

export default function EmptyState({ onCreateGoal }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 6, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        No goals yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Start tracking your financial goals today.
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateGoal}>
        Create Your First Goal
      </Button>
    </Paper>
  );
}
