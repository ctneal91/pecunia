import { Container, Box, Paper, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';

interface InvalidInviteStateProps {
  error: string;
}

export default function InvalidInviteState({ error }: InvalidInviteStateProps) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CancelIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Invalid Invitation
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Go Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
