import { Box, Typography, Paper, TextField, Button, InputAdornment, Chip, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { SPACING } from '../../constants/ui';
import { LOADING_MESSAGES } from '../../constants/messages';

interface ContributionFormProps {
  amount: string;
  note: string;
  isWithdrawal: boolean;
  submitting: boolean;
  error: string | null;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onWithdrawalToggle: (isWithdrawal: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ContributionForm({
  amount,
  note,
  isWithdrawal,
  submitting,
  error,
  onAmountChange,
  onNoteChange,
  onWithdrawalToggle,
  onSubmit,
}: ContributionFormProps) {
  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
      <Typography variant="h6" gutterBottom>
        Add Contribution
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={onSubmit}>
        <Box sx={{ display: 'flex', gap: SPACING.BUTTON_GAP, mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          <Chip
            icon={<AddIcon />}
            label="Deposit"
            color={!isWithdrawal ? 'primary' : 'default'}
            onClick={() => onWithdrawalToggle(false)}
            variant={!isWithdrawal ? 'filled' : 'outlined'}
          />
          <Chip
            icon={<RemoveIcon />}
            label="Withdrawal"
            color={isWithdrawal ? 'error' : 'default'}
            onClick={() => onWithdrawalToggle(true)}
            variant={isWithdrawal ? 'filled' : 'outlined'}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: SPACING.ITEM_GAP, flexWrap: 'wrap' }}>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ width: 150 }}
            required
          />
          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Button
            type="submit"
            variant="contained"
            color={isWithdrawal ? 'error' : 'primary'}
            disabled={submitting || !amount}
          >
            {submitting ? LOADING_MESSAGES.SUBMITTING : isWithdrawal ? 'Withdraw' : 'Add'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
