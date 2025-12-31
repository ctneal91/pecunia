import { Container, Box, Alert } from '@mui/material';

export default function UnauthenticatedState() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">
          Please log in to view your goals by category.
        </Alert>
      </Box>
    </Container>
  );
}
