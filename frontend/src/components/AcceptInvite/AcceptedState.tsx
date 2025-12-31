import { Container, Box, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AcceptedStateProps {
  groupName: string;
}

export default function AcceptedState({ groupName }: AcceptedStateProps) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Welcome to {groupName}!
          </Typography>
          <Typography color="text.secondary">
            Redirecting you to the group...
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
