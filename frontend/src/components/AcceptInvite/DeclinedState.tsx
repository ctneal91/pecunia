import { Container, Box, Paper, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface DeclinedStateProps {
  groupName: string;
}

export default function DeclinedState({ groupName }: DeclinedStateProps) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Invitation Declined
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You've declined the invitation to join {groupName}.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Go Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
