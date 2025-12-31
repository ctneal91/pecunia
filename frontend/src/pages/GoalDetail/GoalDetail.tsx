import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RepeatIcon from '@mui/icons-material/Repeat';
import { useGoals } from '../../contexts/GoalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { RecurringContributionInput } from '../../types/goal';
import MilestoneCelebration from '../../components/MilestoneCelebration';
import ProgressChart from '../../components/ProgressChart';
import SavingsProjection from '../../components/SavingsProjection';
import RecurringContributionForm from '../../components/RecurringContributionForm';
import RecurringContributionList from '../../components/RecurringContributionList';
import GoalHeader from '../../components/GoalHeader';
import ContributorsSection from '../../components/ContributorsSection';
import ContributionForm from '../../components/ContributionForm';
import { exportGoalReport } from '../../utils/export';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useGoalData } from '../../hooks/useGoalData';
import { useContribution } from '../../hooks/useContribution';
import { SPACING } from '../../constants/ui';
import { CONFIRMATION_MESSAGES, ERROR_MESSAGES, LOADING_MESSAGES } from '../../constants/messages';

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
    if (!window.confirm(CONFIRMATION_MESSAGES.DELETE_CONTRIBUTION)) return;

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
    if (!window.confirm(CONFIRMATION_MESSAGES.DELETE_RECURRING)) return;

    const response = await api.deleteRecurringContribution(goal.id, rcId);
    if (!response.error) {
      await refreshGoalData();
    }
  };

  const handleExport = async () => {
    if (!goal || typeof goal.id !== 'number') return;
    setExporting(true);
    try {
      await exportGoalReport(goal.id, goal.title);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
          <Typography>{LOADING_MESSAGES.LOADING}</Typography>
        </Box>
      </Container>
    );
  }

  if (!goal) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
          <Alert severity="error">{ERROR_MESSAGES.GOAL_NOT_FOUND}</Alert>
          <Button onClick={() => navigate('/goals')} sx={{ mt: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
            Back to Goals
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/goals')} sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          Back to Goals
        </Button>

        <GoalHeader
          goal={goal}
          showExport={!!user && typeof goal.id === 'number'}
          exporting={exporting}
          onExport={handleExport}
          onEdit={() => navigate(`/goals/${goal.id}/edit`)}
        />

        {goal.group_id && goal.contributors && (
          <ContributorsSection
            contributors={goal.contributors}
            contributorCount={goal.contributor_count || 0}
          />
        )}

        <ContributionForm
          amount={contributionHook.amount}
          note={contributionHook.note}
          isWithdrawal={contributionHook.isWithdrawal}
          submitting={contributionHook.submitting}
          error={contributionHook.error}
          onAmountChange={contributionHook.setAmount}
          onNoteChange={contributionHook.setNote}
          onWithdrawalToggle={contributionHook.setIsWithdrawal}
          onSubmit={handleAddContribution}
        />

        {user && (
          <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.BUTTON_GAP }}>
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
              <Box sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
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
          <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
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
          <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
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
          <Paper sx={{ p: SPACING.PADDING_STANDARD }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.BUTTON_GAP }}>
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
