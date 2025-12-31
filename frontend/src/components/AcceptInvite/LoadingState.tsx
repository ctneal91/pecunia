import { Container, Box, Paper, Skeleton } from '@mui/material';

export default function LoadingState() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Skeleton variant="circular" width={64} height={64} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width="80%" sx={{ mx: 'auto', mt: 1 }} />
        </Paper>
      </Box>
    </Container>
  );
}
