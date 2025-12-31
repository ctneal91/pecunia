import { Container, Box, Paper, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';

interface InviteStatusStateProps {
  status: 'accepted' | 'expired' | 'declined';
  groupName: string;
  inviterName?: string;
}

export default function InviteStatusState({ status, groupName, inviterName }: InviteStatusStateProps) {
  const getTitle = () => {
    if (status === 'accepted') return 'Invitation Already Accepted';
    if (status === 'expired') return 'Invitation Expired';
    return 'Invitation Declined';
  };

  const getMessage = () => {
    if (status === 'accepted') return 'This invitation has already been used.';
    if (status === 'expired') {
      return `This invitation to join ${groupName} has expired.${inviterName ? ` Please ask ${inviterName} to send a new invitation.` : ' Please ask for a new invitation.'}`;
    }
    return `This invitation to join ${groupName} was declined.`;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {status === 'expired' && (
            <CancelIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          )}
          <Typography variant="h5" gutterBottom>
            {getTitle()}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {getMessage()}
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Go Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
