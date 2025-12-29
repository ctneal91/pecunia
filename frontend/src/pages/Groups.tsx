import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import LinkIcon from '@mui/icons-material/Link';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Group } from '../types/group';

function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  return (
    <Paper
      sx={{ p: 3, mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h6">{group.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {group.member_count} {group.member_count === 1 ? 'member' : 'members'} · {group.goal_count} {group.goal_count === 1 ? 'goal' : 'goals'}
            </Typography>
          </Box>
        </Box>
        {group.is_admin && (
          <Chip label="Admin" size="small" color="primary" variant="outlined" />
        )}
      </Box>
    </Paper>
  );
}

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const response = await api.getGroups();
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setGroups(response.data.groups);
    }
    setLoading(false);
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;

    setSubmitting(true);
    setDialogError(null);

    const response = await api.createGroup({ name: newGroupName.trim() });
    if (response.error) {
      setDialogError(response.error);
      setSubmitting(false);
    } else if (response.data) {
      setGroups([response.data.group, ...groups]);
      setCreateDialogOpen(false);
      setNewGroupName('');
      setSubmitting(false);
      navigate(`/groups/${response.data.group.id}`);
    }
  }

  async function handleJoinGroup() {
    if (!inviteCode.trim()) return;

    setSubmitting(true);
    setDialogError(null);

    const response = await api.joinGroup(inviteCode.trim());
    if (response.error) {
      setDialogError(response.error);
      setSubmitting(false);
    } else if (response.data) {
      setGroups([response.data.group, ...groups]);
      setJoinDialogOpen(false);
      setInviteCode('');
      setSubmitting(false);
      navigate(`/groups/${response.data.group.id}`);
    }
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            Please log in to create or join groups.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Groups
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={() => setJoinDialogOpen(true)}
            >
              Join Group
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Group
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {groups.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Groups Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create a group to share goals with family, friends, or roommates.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => setJoinDialogOpen(true)}
              >
                Join with Invite Code
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Group
              </Button>
            </Box>
          </Paper>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => navigate(`/groups/${group.id}`)}
            />
          ))
        )}
      </Box>

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g., Family, Roommates, Couple"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained" disabled={submitting || !newGroupName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Group</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Invite Code"
            fullWidth
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Paste the invite code here"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleJoinGroup} variant="contained" disabled={submitting || !inviteCode.trim()}>
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
