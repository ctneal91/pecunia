import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { useGoals } from '../../contexts/GoalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { GoalType, GOAL_TYPE_LABELS, GOAL_TYPE_ICONS, GoalInput } from '../../types/goal';
import { Group } from '../../types/group';
import GoalTemplates from '../../components/GoalTemplates';
import { GoalTemplate } from '../../data/goalTemplates';

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

const steps = ['Choose Template', 'Customize Goal'];

export default function GoalForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { goals, createGoal, updateGoal } = useGoals();
  const isEditing = Boolean(id);

  const [activeStep, setActiveStep] = useState(isEditing ? 1 : 0);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('savings');
  const [targetDate, setTargetDate] = useState('');
  const [groupId, setGroupId] = useState<number | ''>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.getGroups().then((response) => {
        if (response.data) {
          setGroups(response.data.groups);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && id) {
      const goal = goals.find((g) => String(g.id) === id);
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setTargetAmount(String(goal.target_amount));
        setCurrentAmount(String(goal.current_amount));
        setGoalType(goal.goal_type);
        setTargetDate(goal.target_date || '');
        setGroupId(goal.group_id || '');
      }
    }
  }, [isEditing, id, goals]);

  const handleSelectTemplate = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    setDescription(template.description);
    setTargetAmount(String(template.suggestedAmount));
    setGoalType(template.goalType);

    if (template.suggestedMonths) {
      const date = new Date();
      date.setMonth(date.getMonth() + template.suggestedMonths);
      setTargetDate(date.toISOString().split('T')[0]);
    }
  };

  const handleNextStep = () => {
    setActiveStep(1);
  };

  const handleBackStep = () => {
    setActiveStep(0);
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setActiveStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }

    const current = currentAmount ? parseFloat(currentAmount) : 0;
    if (isNaN(current) || current < 0) {
      setError('Current amount cannot be negative');
      return;
    }

    setLoading(true);

    const input: GoalInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      target_amount: target,
      current_amount: current,
      goal_type: goalType,
      target_date: targetDate || undefined,
      group_id: groupId || undefined,
    };

    let result;
    if (isEditing && id) {
      result = await updateGoal(id, input);
    } else {
      result = await createGoal(input);
    }

    setLoading(false);

    if (result) {
      navigate('/goals');
    } else {
      setError('Failed to save goal. Please try again.');
    }
  };

  const renderTemplateStep = () => (
    <Box>
      <GoalTemplates
        onSelectTemplate={handleSelectTemplate}
        selectedTemplateId={selectedTemplate?.id}
      />

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/goals')}
        >
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="text"
            onClick={handleSkipTemplate}
          >
            Skip - Create Custom Goal
          </Button>
          <Button
            variant="contained"
            onClick={handleNextStep}
            disabled={!selectedTemplate}
          >
            Continue with Template
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderFormStep = () => (
    <Box component="form" onSubmit={handleSubmit}>
      {selectedTemplate && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Using template: <strong>{selectedTemplate.name}</strong>. Customize the details below.
        </Alert>
      )}

      <TextField
        label="Goal Title"
        fullWidth
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        placeholder="e.g., Emergency Fund"
      />

      <TextField
        select
        label="Goal Type"
        fullWidth
        required
        value={goalType}
        onChange={(e) => setGoalType(e.target.value as GoalType)}
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
        onChange={(e) => setTargetAmount(e.target.value)}
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
        onChange={(e) => setCurrentAmount(e.target.value)}
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
        onChange={(e) => setTargetDate(e.target.value)}
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
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
        placeholder="Optional: Add notes about this goal"
      />

      {user && groups.length > 0 && (
        <TextField
          select
          label="Share with Group"
          fullWidth
          value={groupId}
          onChange={(e) => setGroupId(e.target.value === '' ? '' : Number(e.target.value))}
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

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        {!isEditing && (
          <Button
            variant="outlined"
            onClick={handleBackStep}
            disabled={loading}
          >
            Back
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={() => navigate('/goals')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ flex: 1 }}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth={isEditing ? 'sm' : 'md'}>
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </Typography>

          {!isEditing && (
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!isEditing && activeStep === 0 ? renderTemplateStep() : renderFormStep()}
        </Paper>
      </Box>
    </Container>
  );
}
