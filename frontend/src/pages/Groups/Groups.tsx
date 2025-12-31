import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Group } from '../../types/group';
import { SPACING } from '../../constants/ui';
import {
  UnauthenticatedState,
  LoadingState,
  EmptyState,
  GroupCard,
  CreateGroupDialog,
  JoinGroupDialog,
  PageHeader,
} from './components';

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
    return <UnauthenticatedState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
        <PageHeader
          onJoinGroup={() => setJoinDialogOpen(true)}
          onCreateGroup={() => setCreateDialogOpen(true)}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {groups.length === 0 ? (
          <EmptyState
            onCreateGroup={() => setCreateDialogOpen(true)}
            onJoinGroup={() => setJoinDialogOpen(true)}
          />
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

      <CreateGroupDialog
        open={createDialogOpen}
        newGroupName={newGroupName}
        submitting={submitting}
        dialogError={dialogError}
        onClose={() => setCreateDialogOpen(false)}
        onNameChange={setNewGroupName}
        onCreate={handleCreateGroup}
      />

      <JoinGroupDialog
        open={joinDialogOpen}
        inviteCode={inviteCode}
        submitting={submitting}
        dialogError={dialogError}
        onClose={() => setJoinDialogOpen(false)}
        onInviteCodeChange={setInviteCode}
        onJoin={handleJoinGroup}
      />
    </Container>
  );
}
