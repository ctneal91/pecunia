import { Container, Box, Button, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SPACING } from '../../../constants/ui';

interface NotFoundStateProps {
  error: string;
  onBackToGroups: () => void;
}

export default function NotFoundState({ error, onBackToGroups }: NotFoundStateProps) {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBackToGroups} sx={{ mb: 2 }}>
          Back to Groups
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    </Container>
  );
}
