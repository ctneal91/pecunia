import { Box, Button, Typography, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface CategoryHeaderProps {
  icon: string;
  name: string;
  templateCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function CategoryHeader({
  icon,
  name,
  templateCount,
  isExpanded,
  onToggle,
}: CategoryHeaderProps) {
  return (
    <Button
      fullWidth
      onClick={onToggle}
      sx={{
        justifyContent: 'space-between',
        textTransform: 'none',
        py: 1.5,
        px: 2,
        bgcolor: 'action.hover',
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
      endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" component="span">
          {icon}
        </Typography>
        <Typography variant="subtitle1" fontWeight="medium">
          {name}
        </Typography>
        <Chip
          label={templateCount}
          size="small"
          sx={{ ml: 1 }}
        />
      </Box>
    </Button>
  );
}
