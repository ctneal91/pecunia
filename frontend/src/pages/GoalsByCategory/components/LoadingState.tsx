import { Container, Box, Skeleton } from '@mui/material';

export default function LoadingState() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={150} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
      </Box>
    </Container>
  );
}
