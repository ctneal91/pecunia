import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Grid } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useGoals } from '../../contexts/GoalsContext';
import { api, DashboardStats, RecentContribution } from '../../services/api';
import { Goal } from '../../types/goal';
import { StatsGrid, EmptyState } from '../../components/Home';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  GoalsProgressSection,
  RecentActivitySection,
  GuestInfoAlert,
  GuestGoalsSection,
} from './components';

function GuestDashboard() {
  const navigate = useNavigate();
  const { goals } = useGoals();

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <>
      <GuestInfoAlert />

      <StatsGrid
        totalSaved={totalSaved}
        totalTarget={totalTarget}
        activeCount={goals.length - completedCount}
        completedCount={completedCount}
      />

      {goals.length === 0 ? (
        <EmptyState onCreateGoal={() => navigate('/goals/new')} />
      ) : (
        <GuestGoalsSection
          goals={goals}
          onViewAll={() => navigate('/goals')}
          onGoalClick={(id) => navigate(`/goals/${id}`)}
        />
      )}
    </>
  );
}

function AuthenticatedDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentContributions, setRecentContributions] = useState<RecentContribution[]>([]);
  const [goalsSummary, setGoalsSummary] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const response = await api.getDashboard();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setStats(response.data.stats);
        setRecentContributions(response.data.recent_contributions);
        setGoalsSummary(response.data.goals_summary);
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!stats) return null;

  return (
    <>
      <StatsGrid
        totalSaved={stats.total_saved}
        totalTarget={stats.total_target}
        activeCount={stats.active_count}
        completedCount={stats.completed_count}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GoalsProgressSection
            goals={goalsSummary}
            onViewAll={() => navigate('/goals')}
            onGoalClick={(id) => navigate(`/goals/${id}`)}
            onCreateGoal={() => navigate('/goals/new')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <RecentActivitySection contributions={recentContributions} />
        </Grid>
      </Grid>
    </>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <PageHeader
          isAuthenticated={!!user}
          userName={user?.name}
          userEmail={user?.email}
        />

        {user ? <AuthenticatedDashboard /> : <GuestDashboard />}
      </Box>
    </Container>
  );
}
