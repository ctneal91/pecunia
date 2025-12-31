import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface PageHeaderProps {
  hasGoals: boolean;
  isAuthenticated: boolean;
  onCreateClick: () => void;
  onExportClick: () => void;
  onCategoryClick: () => void;
}

export default function PageHeader({
  hasGoals,
  isAuthenticated,
  onCreateClick,
  onExportClick,
  onCategoryClick,
}: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" component="h1">
        Your Goals
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {isAuthenticated && hasGoals && (
          <>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={onExportClick}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={onCategoryClick}
            >
              By Category
            </Button>
          </>
        )}
        {hasGoals && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateClick}>
            New Goal
          </Button>
        )}
      </Box>
    </Box>
  );
}
