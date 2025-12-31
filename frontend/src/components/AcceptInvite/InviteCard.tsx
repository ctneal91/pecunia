import { Container, Box, Paper, Typography, Button, Alert } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface InviteCardProps {
  groupName: string;
  inviterName: string;
  submitting: boolean;
  error: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onClearError: () => void;
}

export default function InviteCard({
  groupName,
  inviterName,
  submitting,
  error,
  onAccept,
  onDecline,
  onClearError,
}: InviteCardProps) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={onClearError}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <GroupsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            You're Invited!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {inviterName} invited you to join
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {groupName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Join this group to share financial goals and track progress together.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={onAccept}
              disabled={submitting}
              startIcon={<CheckCircleIcon />}
            >
              {submitting ? 'Joining...' : 'Accept Invitation'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={onDecline}
              disabled={submitting}
              color="inherit"
            >
              Decline
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
