import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ExportFormat } from '../../types/goal';
import {
  exportGoals,
  exportContributions,
  exportSummaryReport,
} from '../../utils/export';

type ExportType = 'goals' | 'contributions' | 'summary';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ExportDialog({ open, onClose }: ExportDialogProps) {
  const [exportType, setExportType] = useState<ExportType>('goals');
  const [format, setFormat] = useState<ExportFormat>('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (exportType) {
        case 'goals':
          await exportGoals(format);
          break;
        case 'contributions':
          await exportContributions(format);
          break;
        case 'summary':
          await exportSummaryReport();
          break;
      }
      onClose();
    } catch {
      setError('Failed to export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showFormatOption = exportType !== 'summary';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Data</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">What to Export</FormLabel>
            <RadioGroup
              value={exportType}
              onChange={(e) => setExportType(e.target.value as ExportType)}
            >
              <FormControlLabel
                value="goals"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Goals</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Export all your goals with progress data
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="contributions"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Contributions</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Export all contributions across all goals
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="summary"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Summary Report</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete report with statistics by category
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {showFormatOption && (
            <FormControl component="fieldset">
              <FormLabel component="legend">Format</FormLabel>
              <RadioGroup
                row
                value={format}
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
              >
                <FormControlLabel value="json" control={<Radio />} label="JSON" />
                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              </RadioGroup>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
