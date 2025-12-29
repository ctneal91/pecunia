import { Container, Typography, Box, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome{user ? `, ${user.name || user.email}` : ''}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user
              ? 'You are logged in. Your data will be saved across sessions.'
              : 'You can use this app without logging in. Sign up or log in to save your data across sessions.'}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
