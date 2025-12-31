import { Container, Box, Typography } from '@mui/material';
import { SPACING } from '../../../constants/ui';
import { LOADING_MESSAGES } from '../../../constants/messages';

export default function LoadingState() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
        <Typography>{LOADING_MESSAGES.LOADING}</Typography>
      </Box>
    </Container>
  );
}
