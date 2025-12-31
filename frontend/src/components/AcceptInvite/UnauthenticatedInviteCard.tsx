import { Container, Box, Paper, Typography, Button, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';

interface UnauthenticatedInviteCardProps {
  groupName: string;
  inviterName: string;
  token: string;
}

export default function UnauthenticatedInviteCard({
  groupName,
  inviterName,
  token,
}: UnauthenticatedInviteCardProps) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
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
          <Divider sx={{ my: 3 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Please log in or create an account to accept this invitation.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={RouterLink}
              to={`/login?redirect=/invites/${token}`}
              variant="contained"
            >
              Log In
            </Button>
            <Button
              component={RouterLink}
              to={`/register?redirect=/invites/${token}`}
              variant="outlined"
            >
              Create Account
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
