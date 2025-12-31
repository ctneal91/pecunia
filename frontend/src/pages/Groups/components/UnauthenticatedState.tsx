import { Container, Box, Alert } from '@mui/material';
import { SPACING } from '../../../constants/ui';

export default function UnauthenticatedState() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
        <Alert severity="info">
          Please log in to create or join groups.
        </Alert>
      </Box>
    </Container>
  );
}
