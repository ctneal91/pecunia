import { Paper, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface EmptyStateProps {
  isAuthenticated: boolean;
  onCreateClick: () => void;
}

export default function EmptyState({ isAuthenticated, onCreateClick }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 6, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        No goals yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Start tracking your financial goals today.
        {!isAuthenticated && ' Your goals will be saved in your browser until you create an account.'}
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateClick}>
        Create Your First Goal
      </Button>
    </Paper>
  );
}
