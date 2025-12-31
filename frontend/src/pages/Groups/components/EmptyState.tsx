import { Paper, Typography, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import GroupIcon from '@mui/icons-material/Group';

interface EmptyStateProps {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

export default function EmptyState({ onCreateGroup, onJoinGroup }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 6, textAlign: 'center' }}>
      <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Groups Yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create a group to share goals with family, friends, or roommates.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<LinkIcon />}
          onClick={onJoinGroup}
        >
          Join with Invite Code
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateGroup}
        >
          Create Group
        </Button>
      </Box>
    </Paper>
  );
}
