import { Box, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface TemplateCardHeaderProps {
  name: string;
  description: string;
  isSelected: boolean;
}

export default function TemplateCardHeader({
  name,
  description,
  isSelected,
}: TemplateCardHeaderProps) {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {name}
        </Typography>
        {isSelected && (
          <CheckCircleOutlineIcon color="primary" fontSize="small" />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
    </>
  );
}
