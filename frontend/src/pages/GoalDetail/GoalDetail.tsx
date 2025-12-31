import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGoals } from '../../contexts/GoalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { RecurringContributionInput } from '../../types/goal';
import MilestoneCelebration from '../../components/MilestoneCelebration';
import GoalHeader from '../../components/GoalHeader';
import ContributorsSection from '../../components/ContributorsSection';
import ContributionForm from '../../components/ContributionForm';
import { exportGoalReport } from '../../utils/export';
import { useGoalData } from '../../hooks/useGoalData';
import { useContribution } from '../../hooks/useContribution';
import { SPACING } from '../../constants/ui';
import { CONFIRMATION_MESSAGES } from '../../constants/messages';
import {
  LoadingState,
  NotFoundState,
  RecurringContributionsSection,
  ProgressChartSection,
  SavingsProjectionSection,
  ContributionHistory,
  UnauthenticatedMessage,
} from './components';

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

    const response = await api.createRecurringContribution(goal.id, data);
    if (response.data) {
      await refreshGoalData();
    }
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
    return <LoadingState />;
  }

  if (!goal) {
    return <NotFoundState onBackToGoals={() => navigate('/goals')} />;
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
          <RecurringContributionsSection
            recurringContributions={recurringContributions}
            onCreateRecurring={handleCreateRecurring}
            onToggleActive={handleToggleRecurringActive}
            onDelete={handleDeleteRecurring}
          />
        )}

        {user && (
          <ProgressChartSection
            contributions={contributions}
            milestones={goal.milestones}
            targetAmount={goal.target_amount}
            currentAmount={goal.current_amount}
          />
        )}

        {user && (
          <SavingsProjectionSection
            contributions={contributions}
            targetAmount={goal.target_amount}
            currentAmount={goal.current_amount}
            targetDate={goal.target_date}
          />
        )}

        {user && (
          <ContributionHistory
            contributions={contributions}
            onDelete={handleDeleteContribution}
          />
        )}

        {!user && <UnauthenticatedMessage />}
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
