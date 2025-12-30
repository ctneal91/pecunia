import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  LinearProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Divider,
  InputAdornment,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useGoals } from '../../contexts/GoalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Goal, Contribution, ContributionInput, Contributor, GOAL_TYPE_LABELS, GOAL_TYPE_ICONS } from '../../types/goal';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goals, updateGoal, refreshGoals } = useGoals();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isWithdrawal, setIsWithdrawal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const foundGoal = goals.find((g) => String(g.id) === id);

    if (user && foundGoal && typeof foundGoal.id === 'number') {
      // Fetch full goal data including contributors for logged-in users
      api.getGoal(foundGoal.id).then((response) => {
        if (response.data) {
          setGoal(response.data.goal);
        } else if (foundGoal) {
          setGoal(foundGoal);
        }
        setLoading(false);
      });

      api.getContributions(foundGoal.id).then((response) => {
        if (response.data) {
          setContributions(response.data.contributions);
        }
      });
    } else if (foundGoal) {
      setGoal(foundGoal);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, goals, user]);

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const finalAmount = isWithdrawal ? -parsedAmount : parsedAmount;
    setSubmitting(true);
    setError(null);

    if (user && typeof goal.id === 'number') {
      const input: ContributionInput = {
        amount: finalAmount,
        note: note || undefined,
        contributed_at: new Date().toISOString(),
      };

      const response = await api.createContribution(goal.id, input);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setContributions((prev) => [response.data!.contribution, ...prev]);
        setGoal(response.data.goal);
        await refreshGoals();
        setAmount('');
        setNote('');
      }
    } else {
      // Guest mode: update goal directly
      const newAmount = goal.current_amount + finalAmount;
      const updated = await updateGoal(goal.id, { current_amount: Math.max(0, newAmount) });
      if (updated) {
        setGoal(updated);
      }
      setAmount('');
      setNote('');
    }

    setSubmitting(false);
  };

  const handleDeleteContribution = async (contributionId: number) => {
    if (!goal || typeof goal.id !== 'number') return;
    if (!window.confirm('Delete this contribution?')) return;

    const response = await api.deleteContribution(goal.id, contributionId);
    if (response.data) {
      setContributions((prev) => prev.filter((c) => c.id !== contributionId));
      setGoal(response.data.goal);
      await refreshGoals();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (!goal) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Goal not found</Alert>
          <Button onClick={() => navigate('/goals')} sx={{ mt: 2 }}>
            Back to Goals
          </Button>
        </Box>
      </Container>
    );
  }

  const progressColor = goal.completed ? 'success' : 'primary';

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/goals')} sx={{ mb: 2 }}>
          Back to Goals
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h3" component="span">
                {GOAL_TYPE_ICONS[goal.goal_type]}
              </Typography>
              <Box>
                <Typography variant="h4" component="h1">
                  {goal.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {GOAL_TYPE_LABELS[goal.goal_type]}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/goals/${goal.id}/edit`)}
            >
              Edit
            </Button>
          </Box>

          {goal.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {goal.description}
            </Typography>
          )}

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h5">
                {formatCurrency(goal.current_amount)}
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {formatCurrency(goal.target_amount)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(goal.progress_percentage, 100)}
              color={progressColor}
              sx={{ height: 12, borderRadius: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {goal.progress_percentage}% complete
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {goal.completed ? 'Goal reached!' : `${formatCurrency(goal.remaining_amount)} to go`}
              </Typography>
            </Box>
          </Box>

          {goal.target_date && (
            <Typography variant="body2" color="text.secondary">
              Target date: {formatDate(goal.target_date)}
            </Typography>
          )}

          {goal.group_id && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <GroupIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Shared goal in {goal.group_name}
              </Typography>
            </Box>
          )}
        </Paper>

        {goal.group_id && goal.contributors && goal.contributors.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <GroupIcon color="primary" />
              <Typography variant="h6">
                Contributors ({goal.contributor_count})
              </Typography>
            </Box>
            <List disablePadding>
              {goal.contributors.map((contributor: Contributor, index: number) => (
                <Box key={contributor.user_id}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ px: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
                      <PersonIcon color="action" />
                    </Box>
                    <ListItemText
                      primary={contributor.user_name}
                      secondary={`${contributor.contribution_count} contribution${contributor.contribution_count !== 1 ? 's' : ''}`}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {formatCurrency(contributor.total_amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contributor.percentage}%
                      </Typography>
                    </Box>
                  </ListItem>
                </Box>
              ))}
            </List>
          </Paper>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Contribution
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleAddContribution}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                icon={<AddIcon />}
                label="Deposit"
                color={!isWithdrawal ? 'primary' : 'default'}
                onClick={() => setIsWithdrawal(false)}
                variant={!isWithdrawal ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<RemoveIcon />}
                label="Withdrawal"
                color={isWithdrawal ? 'error' : 'default'}
                onClick={() => setIsWithdrawal(true)}
                variant={isWithdrawal ? 'filled' : 'outlined'}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                label="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Button
                type="submit"
                variant="contained"
                color={isWithdrawal ? 'error' : 'primary'}
                disabled={submitting || !amount}
              >
                {submitting ? 'Adding...' : isWithdrawal ? 'Withdraw' : 'Add'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {user && contributions.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contribution History
            </Typography>
            <List>
              {contributions.map((contribution, index) => (
                <Box key={contribution.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteContribution(contribution.id as number)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: contribution.amount >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                          >
                            {contribution.amount >= 0 ? '+' : ''}{formatCurrency(contribution.amount)}
                          </Typography>
                          {contribution.note && (
                            <Typography variant="body2" color="text.secondary">
                              — {contribution.note}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={formatDate(contribution.contributed_at)}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Paper>
        )}

        {!user && (
          <Alert severity="info">
            Sign up to track your contribution history and sync across devices.
          </Alert>
        )}
      </Box>
    </Container>
  );
}
