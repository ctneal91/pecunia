import { TextField, MenuItem, InputAdornment } from '@mui/material';
import { GoalType, GOAL_TYPE_LABELS, GOAL_TYPE_ICONS } from '../../types/goal';
import { Group } from '../../types/group';

const GOAL_TYPES: GoalType[] = [
  'emergency_fund',
  'savings',
  'debt_payoff',
  'retirement',
  'vacation',
  'home',
  'education',
  'vehicle',
  'other',
];

interface GoalFormFieldsProps {
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  goalType: GoalType;
  targetDate: string;
  groupId: number | '';
  groups: Group[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTargetAmountChange: (value: string) => void;
  onCurrentAmountChange: (value: string) => void;
  onGoalTypeChange: (value: GoalType) => void;
  onTargetDateChange: (value: string) => void;
  onGroupIdChange: (value: number | '') => void;
}

export default function GoalFormFields({
  title,
  description,
  targetAmount,
  currentAmount,
  goalType,
  targetDate,
  groupId,
  groups,
  onTitleChange,
  onDescriptionChange,
  onTargetAmountChange,
  onCurrentAmountChange,
  onGoalTypeChange,
  onTargetDateChange,
  onGroupIdChange,
}: GoalFormFieldsProps) {
  return (
    <>
      <TextField
        label="Goal Title"
        fullWidth
        required
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        margin="normal"
        placeholder="e.g., Emergency Fund"
      />

      <TextField
        select
        label="Goal Type"
        fullWidth
        required
        value={goalType}
        onChange={(e) => onGoalTypeChange(e.target.value as GoalType)}
        margin="normal"
      >
        {GOAL_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {GOAL_TYPE_ICONS[type]} {GOAL_TYPE_LABELS[type]}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Target Amount"
        fullWidth
        required
        type="number"
        value={targetAmount}
        onChange={(e) => onTargetAmountChange(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        inputProps={{ min: 0, step: 0.01 }}
      />

      <TextField
        label="Current Amount"
        fullWidth
        type="number"
        value={currentAmount}
        onChange={(e) => onCurrentAmountChange(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        inputProps={{ min: 0, step: 0.01 }}
        helperText="How much have you saved so far?"
      />

      <TextField
        label="Target Date"
        fullWidth
        type="date"
        value={targetDate}
        onChange={(e) => onTargetDateChange(e.target.value)}
        margin="normal"
        InputLabelProps={{ shrink: true }}
        helperText="Optional: When do you want to reach this goal?"
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        margin="normal"
        placeholder="Optional: Add notes about this goal"
      />

      {groups.length > 0 && (
        <TextField
          select
          label="Share with Group"
          fullWidth
          value={groupId}
          onChange={(e) => onGroupIdChange(e.target.value === '' ? '' : Number(e.target.value))}
          margin="normal"
          helperText="Optional: Assign this goal to a group so all members can see it"
        >
          <MenuItem value="">Personal (not shared)</MenuItem>
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
}
