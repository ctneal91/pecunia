import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { InviteDetails } from '../types/group';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    loadInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadInvite() {
    if (!token) return;

    const response = await api.getInviteDetails(token);
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setInvite(response.data.invite);
    }
    setLoading(false);
  }

  async function handleAccept() {
    if (!token) return;

    setSubmitting(true);
    setError(null);

    const response = await api.acceptInvite(token);
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setAccepted(true);
      setTimeout(() => {
        navigate(`/groups/${response.data!.group.id}`);
      }, 2000);
    }
    setSubmitting(false);
  }

  async function handleDecline() {
    if (!token) return;

    setSubmitting(true);
    setError(null);

    const response = await api.declineInvite(token);
    if (response.error) {
      setError(response.error);
    } else {
      setDeclined(true);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Skeleton variant="circular" width={64} height={64} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width="80%" sx={{ mx: 'auto', mt: 1 }} />
          </Paper>
        </Box>
      </Container>
    );
  }

  if (error && !invite) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CancelIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Invalid Invitation
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button component={RouterLink} to="/" variant="contained">
              Go Home
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!invite) return null;

  if (accepted) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Welcome to {invite.group_name}!
            </Typography>
            <Typography color="text.secondary">
              Redirecting you to the group...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (declined) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Invitation Declined
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              You've declined the invitation to join {invite.group_name}.
            </Typography>
            <Button component={RouterLink} to="/" variant="contained">
              Go Home
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (invite.status !== 'pending') {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Invitation {invite.status === 'accepted' ? 'Already Accepted' : invite.status === 'expired' ? 'Expired' : 'Declined'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {invite.status === 'accepted' && 'This invitation has already been used.'}
              {invite.status === 'expired' && 'This invitation has expired. Please ask for a new invitation.'}
              {invite.status === 'declined' && 'This invitation was declined.'}
            </Typography>
            <Button component={RouterLink} to="/" variant="contained">
              Go Home
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (invite.expired) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CancelIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Invitation Expired
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              This invitation to join {invite.group_name} has expired. Please ask {invite.inviter_name} to send a new invitation.
            </Typography>
            <Button component={RouterLink} to="/" variant="contained">
              Go Home
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <GroupsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              You're Invited!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {invite.inviter_name} invited you to join
            </Typography>
            <Typography variant="h6" sx={{ mb: 3 }}>
              {invite.group_name}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Please log in or create an account to accept this invitation.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                component={RouterLink}
                to={`/login?redirect=/invites/${token}`}
                variant="contained"
              >
                Log In
              </Button>
              <Button
                component={RouterLink}
                to={`/register?redirect=/invites/${token}`}
                variant="outlined"
              >
                Create Account
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <GroupsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            You're Invited!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {invite.inviter_name} invited you to join
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {invite.group_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Join this group to share financial goals and track progress together.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleAccept}
              disabled={submitting}
              startIcon={<CheckCircleIcon />}
            >
              {submitting ? 'Joining...' : 'Accept Invitation'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleDecline}
              disabled={submitting}
              color="inherit"
            >
              Decline
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
