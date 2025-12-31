import { Container, Box, Skeleton } from '@mui/material';
import { SPACING } from '../../../constants/ui';

export default function LoadingState() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
      </Box>
    </Container>
  );
}
