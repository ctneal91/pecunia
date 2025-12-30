import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
  InputAdornment,
} from '@mui/material';
import { RecurringFrequency, FREQUENCY_LABELS, RecurringContributionInput } from '../../types/goal';

interface RecurringContributionFormProps {
  onSubmit: (data: RecurringContributionInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RecurringContributionForm({
  onSubmit,
  onCancel,
  loading = false,
}: RecurringContributionFormProps) {
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!startDate) {
      setError('Please select a start date');
      return;
    }

    const data: RecurringContributionInput = {
      amount: parsedAmount,
      frequency,
      next_occurrence_at: new Date(startDate).toISOString(),
      note: note || undefined,
    };

    if (endDate) {
      data.end_date = new Date(endDate).toISOString();
    }

    try {
      await onSubmit(data);
    } catch {
      setError('Failed to create recurring contribution');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          inputProps={{ min: 0, step: 0.01 }}
          sx={{ width: 150 }}
          required
        />

        <TextField
          select
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
          sx={{ width: 150 }}
        >
          {(Object.keys(FREQUENCY_LABELS) as RecurringFrequency[]).map((freq) => (
            <MenuItem key={freq} value={freq}>
              {FREQUENCY_LABELS[freq]}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
          required
        />

        <TextField
          label="End Date (Optional)"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
          helperText="Leave empty for no end date"
        />
      </Box>

      <TextField
        label="Note (Optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !amount}
        >
          {loading ? 'Creating...' : 'Create Recurring'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
