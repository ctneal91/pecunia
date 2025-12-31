import { Box, Chip } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

interface TemplateChipsProps {
  suggestedAmount: number;
  suggestedMonths?: number;
}

export default function TemplateChips({ suggestedAmount, suggestedMonths }: TemplateChipsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
      <Chip
        label={formatCurrency(suggestedAmount)}
        size="small"
        color="primary"
        variant="outlined"
      />
      {suggestedMonths && (
        <Chip
          label={`${suggestedMonths} months`}
          size="small"
          variant="outlined"
        />
      )}
    </Box>
  );
}
