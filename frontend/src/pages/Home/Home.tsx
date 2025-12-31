import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SavingsIcon from '@mui/icons-material/Savings';
import { useAuth } from '../../contexts/AuthContext';
import { useGoals } from '../../contexts/GoalsContext';
import { api, DashboardStats, RecentContribution } from '../../services/api';
import { Goal, GOAL_TYPE_ICONS } from '../../types/goal';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

function StatCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon: React.ReactNode }) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color: 'primary.main' }}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

function GuestDashboard() {
  const navigate = useNavigate();
  const { goals } = useGoals();

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const completedCount = goals.filter((g) => g.completed).length;
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Your data is saved locally. Sign up to sync across devices and track contribution history.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Saved"
            value={formatCurrency(totalSaved)}
            icon={<SavingsIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Progress"
            value={`${overallProgress.toFixed(1)}%`}
            subtitle={`of ${formatCurrency(totalTarget)}`}
            icon={<TrendingUpIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Goals"
            value={String(goals.length - completedCount)}
            icon={<SavingsIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={String(completedCount)}
            icon={<CheckCircleIcon fontSize="large" />}
          />
        </Grid>
      </Grid>

      {goals.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Start Your Financial Journey
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first goal to start tracking your savings.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/goals/new')}>
            Create Your First Goal
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Your Goals</Typography>
            <Button size="small" onClick={() => navigate('/goals')}>
              View All
            </Button>
          </Box>
          {goals.slice(0, 3).map((goal) => (
            <Box
              key={goal.id}
              sx={{ mb: 2, cursor: 'pointer' }}
              onClick={() => navigate(`/goals/${goal.id}`)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body1">
                  {GOAL_TYPE_ICONS[goal.goal_type]} {goal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {goal.progress_percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(goal.progress_percentage, 100)}
                color={goal.completed ? 'success' : 'primary'}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Saved"
            value={formatCurrency(stats.total_saved)}
            icon={<SavingsIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Progress"
            value={`${stats.overall_progress}%`}
            subtitle={`of ${formatCurrency(stats.total_target)}`}
            icon={<TrendingUpIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Goals"
            value={String(stats.active_count)}
            icon={<SavingsIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={String(stats.completed_count)}
            icon={<CheckCircleIcon fontSize="large" />}
          />
        </Grid>
      </Grid>

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
                <Box
                  key={goal.id}
                  sx={{ mb: 2, cursor: 'pointer' }}
                  onClick={() => navigate(`/goals/${goal.id}`)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body1">
                      {GOAL_TYPE_ICONS[goal.goal_type]} {goal.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(goal.progress_percentage, 100)}
                    color={goal.completed ? 'success' : 'primary'}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {recentContributions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No contributions yet. Add to a goal to see activity here.
              </Typography>
            ) : (
              <List dense disablePadding>
                {recentContributions.map((contribution) => (
                  <ListItem
                    key={contribution.id}
                    disablePadding
                    sx={{ py: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            {contribution.goal.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: contribution.amount >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                          >
                            {contribution.amount >= 0 ? '+' : ''}{formatCurrency(contribution.amount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDateShort(contribution.contributed_at)}
                          {contribution.note && ` — ${contribution.note}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
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
