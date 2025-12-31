import { Container, Box, Alert, Button } from '@mui/material';
import { SPACING } from '../../../constants/ui';
import { ERROR_MESSAGES } from '../../../constants/messages';

interface NotFoundStateProps {
  onBackToGoals: () => void;
}

export default function NotFoundState({ onBackToGoals }: NotFoundStateProps) {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
        <Alert severity="error">{ERROR_MESSAGES.GOAL_NOT_FOUND}</Alert>
        <Button onClick={onBackToGoals} sx={{ mt: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          Back to Goals
        </Button>
      </Box>
    </Container>
  );
}
