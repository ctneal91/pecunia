import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Skeleton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../contexts/AuthContext';
import { useGoals } from '../../contexts/GoalsContext';
import { api, DashboardStats, RecentContribution } from '../../services/api';
import { Goal } from '../../types/goal';
import {
  StatsGrid,
  GoalProgressItem,
  EmptyState,
  RecentActivityList,
} from '../../components/Home';

function GuestDashboard() {
  const navigate = useNavigate();
  const { goals } = useGoals();

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Your data is saved locally. Sign up to sync across devices and track contribution history.
      </Alert>

      <StatsGrid
        totalSaved={totalSaved}
        totalTarget={totalTarget}
        activeCount={goals.length - completedCount}
        completedCount={completedCount}
      />

      {goals.length === 0 ? (
        <EmptyState onCreateGoal={() => navigate('/goals/new')} />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Your Goals</Typography>
            <Button size="small" onClick={() => navigate('/goals')}>
              View All
            </Button>
          </Box>
          {goals.slice(0, 3).map((goal) => (
            <GoalProgressItem
              key={goal.id}
              goal={goal}
              onClick={() => navigate(`/goals/${goal.id}`)}
            />
          ))}
        </Paper>
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
    return (
      <>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={200} />
      </>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
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
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Goals Progress</Typography>
              <Button size="small" onClick={() => navigate('/goals')}>
                View All
              </Button>
            </Box>
            {goalsSummary.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No goals yet
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/goals/new')}>
                  Create Goal
                </Button>
              </Box>
            ) : (
              goalsSummary.map((goal) => (
                <GoalProgressItem
                  key={goal.id}
                  goal={goal}
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  showAmounts
                />
              ))
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <RecentActivityList contributions={recentContributions} />
          </Paper>
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
        <Typography variant="h4" component="h1" gutterBottom>
          {user ? `Welcome back, ${user.name || user.email.split('@')[0]}!` : 'Welcome to Pecunia'}
        </Typography>

        {user ? <AuthenticatedDashboard /> : <GuestDashboard />}
      </Box>
    </Container>
  );
}
