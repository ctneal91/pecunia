import { useState } from 'react';
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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import RepeatIcon from '@mui/icons-material/Repeat';
import { useGoals } from '../../contexts/GoalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Goal, Contribution, RecurringContribution, RecurringContributionInput, GOAL_TYPE_LABELS, GOAL_TYPE_ICONS } from '../../types/goal';
import MilestoneCelebration from '../../components/MilestoneCelebration';
import MilestoneProgress from '../../components/MilestoneProgress';
import ProgressChart from '../../components/ProgressChart';
import SavingsProjection from '../../components/SavingsProjection';
import RecurringContributionForm from '../../components/RecurringContributionForm';
import RecurringContributionList from '../../components/RecurringContributionList';
import { exportGoalReport } from '../../utils/export';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useGoalData } from '../../hooks/useGoalData';
import { useContribution } from '../../hooks/useContribution';

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goals, updateGoal, refreshGoals } = useGoals();

  const { goal, contributions, recurringContributions, loading, refreshGoalData } = useGoalData(
    id,
    goals,
    !!user
  );

  const contributionHook = useContribution();

  const [newMilestones, setNewMilestones] = useState<number[]>([]);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [recurringLoading, setRecurringLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    await contributionHook.handleSubmit(
      goal,
      !!user,
      async (contribution, updatedGoal, newMilestonesData) => {
        if (newMilestonesData && newMilestonesData.length > 0) {
          setNewMilestones(newMilestonesData);
        }
        await refreshGoals();
        await refreshGoalData();
      },
      updateGoal
    );
  };

  const handleDeleteContribution = async (contributionId: number) => {
    if (!goal || typeof goal.id !== 'number') return;
    if (!window.confirm('Delete this contribution?')) return;

    const response = await api.deleteContribution(goal.id, contributionId);
    if (response.data) {
      await refreshGoals();
      await refreshGoalData();
    }
  };

  const handleCreateRecurring = async (data: RecurringContributionInput) => {
    if (!goal || typeof goal.id !== 'number') return;

    setRecurringLoading(true);
    const response = await api.createRecurringContribution(goal.id, data);
    if (response.data) {
      await refreshGoalData();
      setShowRecurringForm(false);
    }
    setRecurringLoading(false);
  };

  const handleToggleRecurringActive = async (rcId: number, isActive: boolean) => {
    if (!goal || typeof goal.id !== 'number') return;

    const response = await api.updateRecurringContribution(goal.id, rcId, { is_active: isActive });
    if (response.data) {
      await refreshGoalData();
    }
  };

  const handleDeleteRecurring = async (rcId: number) => {
    if (!goal || typeof goal.id !== 'number') return;
    if (!window.confirm('Delete this recurring contribution?')) return;

    const response = await api.deleteRecurringContribution(goal.id, rcId);
    if (!response.error) {
      await refreshGoalData();
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              {user && typeof goal.id === 'number' && (
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={async () => {
                    setExporting(true);
                    try {
                      await exportGoalReport(goal.id as number, goal.title);
                    } finally {
                      setExporting(false);
                    }
                  }}
                  disabled={exporting}
                >
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/goals/${goal.id}/edit`)}
              >
                Edit
              </Button>
            </Box>
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

          {user && goal.milestones && (
            <MilestoneProgress
              milestones={goal.milestones}
              progressPercentage={goal.progress_percentage}
            />
          )}

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

          {contributionHook.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {contributionHook.error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleAddContribution}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                icon={<AddIcon />}
                label="Deposit"
                color={!contributionHook.isWithdrawal ? 'primary' : 'default'}
                onClick={() => contributionHook.setIsWithdrawal(false)}
                variant={!contributionHook.isWithdrawal ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<RemoveIcon />}
                label="Withdrawal"
                color={contributionHook.isWithdrawal ? 'error' : 'default'}
                onClick={() => contributionHook.setIsWithdrawal(true)}
                variant={contributionHook.isWithdrawal ? 'filled' : 'outlined'}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Amount"
                type="number"
                value={contributionHook.amount}
                onChange={(e) => contributionHook.setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ width: 150 }}
                required
              />
              <TextField
                label="Note (optional)"
                value={contributionHook.note}
                onChange={(e) => contributionHook.setNote(e.target.value)}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Button
                type="submit"
                variant="contained"
                color={contributionHook.isWithdrawal ? 'error' : 'primary'}
                disabled={contributionHook.submitting || !contributionHook.amount}
              >
                {contributionHook.submitting ? 'Adding...' : contributionHook.isWithdrawal ? 'Withdraw' : 'Add'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {user && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RepeatIcon color="primary" />
                <Typography variant="h6">
                  Recurring Contributions
                </Typography>
              </Box>
              {!showRecurringForm && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setShowRecurringForm(true)}
                >
                  Add Recurring
                </Button>
              )}
            </Box>

            {showRecurringForm && (
              <Box sx={{ mb: 2 }}>
                <RecurringContributionForm
                  onSubmit={handleCreateRecurring}
                  onCancel={() => setShowRecurringForm(false)}
                  loading={recurringLoading}
                />
              </Box>
            )}

            <RecurringContributionList
              recurringContributions={recurringContributions}
              onToggleActive={handleToggleRecurringActive}
              onDelete={handleDeleteRecurring}
            />
          </Paper>
        )}

        {user && contributions.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progress Over Time
            </Typography>
            <ProgressChart
              contributions={contributions}
              milestones={goal.milestones}
              targetAmount={goal.target_amount}
              currentAmount={goal.current_amount}
            />
          </Paper>
        )}

        {user && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Savings Projection
            </Typography>
            <SavingsProjection
              contributions={contributions}
              targetAmount={goal.target_amount}
              currentAmount={goal.current_amount}
              targetDate={goal.target_date}
            />
          </Paper>
        )}

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

      {newMilestones.length > 0 && goal && (
        <MilestoneCelebration
          milestones={newMilestones}
          goalTitle={goal.title}
          onClose={() => setNewMilestones([])}
        />
      )}
    </Container>
  );
}
