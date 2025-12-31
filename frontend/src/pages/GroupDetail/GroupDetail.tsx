import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Button, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { GroupWithMembers, Membership, GroupInvite } from '../../types/group';
import GroupHeader from '../../components/GroupHeader';
import InviteSection from '../../components/InviteSection';
import PendingInvites from '../../components/PendingInvites';
import MembersList from '../../components/MembersList';
import {
  EditGroupDialog,
  DeleteGroupDialog,
  LeaveGroupDialog,
  InviteEmailDialog,
  MemberActionsMenu,
} from '../../components/GroupDetail';
import { SPACING } from '../../constants/ui';
import { UnauthenticatedState, LoadingState, NotFoundState } from './components';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadGroup();
  }, [id]);

  useEffect(() => {
    if (group?.is_admin && id) {
      loadInvites();
    }
  }, [group?.is_admin, id]);

  async function loadGroup() {
    if (!id) return;

    const response = await api.getGroup(parseInt(id));
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setGroup(response.data.group);
      setEditName(response.data.group.name);
    }
    setLoading(false);
  }

  async function loadInvites() {
    if (!id) return;

    const response = await api.getGroupInvites(parseInt(id));
    if (response.data) {
      setInvites(response.data.invites);
    }
  }

  async function handleSendInvite() {
    if (!group || !inviteEmail.trim()) return;

    setSendingInvite(true);
    setError(null);
    setInviteSuccess(null);

    const response = await api.sendInvite(group.id, inviteEmail.trim());
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteDialogOpen(false);
      loadInvites();
    }
    setSendingInvite(false);
  }

  async function handleResendInvite(invite: GroupInvite) {
    if (!group) return;

    const response = await api.resendInvite(group.id, invite.id);
    if (response.error) {
      setError(response.error);
    } else {
      setInviteSuccess(`Invitation resent to ${invite.email}`);
      loadInvites();
    }
  }

  async function handleUpdateGroup() {
    if (!group || !editName.trim()) return;

    setSubmitting(true);
    const response = await api.updateGroup(group.id, { name: editName.trim() });
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setGroup({ ...group, name: response.data.group.name });
      setEditDialogOpen(false);
    }
    setSubmitting(false);
  }

  async function handleDeleteGroup() {
    if (!group) return;

    setSubmitting(true);
    const response = await api.deleteGroup(group.id);
    if (response.error) {
      setError(response.error);
      setSubmitting(false);
    } else {
      navigate('/groups');
    }
  }

  async function handleLeaveGroup() {
    if (!group) return;

    setSubmitting(true);
    const response = await api.leaveGroup(group.id);
    if (response.error) {
      setError(response.error);
      setSubmitting(false);
    } else {
      navigate('/groups');
    }
  }

  async function handleRegenerateInvite() {
    if (!group) return;

    const response = await api.regenerateInviteCode(group.id);
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setGroup({ ...group, invite_code: response.data.group.invite_code });
    }
  }

  async function handleCopyInviteCode() {
    if (!group?.invite_code) return;

    await navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggleAdmin(membership: Membership) {
    if (!group) return;

    const newRole = membership.role === 'admin' ? 'member' : 'admin';
    const response = await api.updateMembership(group.id, membership.id, newRole);
    if (response.error) {
      setError(response.error);
    } else {
      loadGroup();
    }
    setMemberMenuAnchor(null);
  }

  async function handleRemoveMember(membership: Membership) {
    if (!group) return;

    const response = await api.removeMember(group.id, membership.id);
    if (response.error) {
      setError(response.error);
    } else {
      loadGroup();
    }
    setMemberMenuAnchor(null);
  }

  if (!user) {
    return <UnauthenticatedState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error && !group) {
    return <NotFoundState error={error} onBackToGroups={() => navigate('/groups')} />;
  }

  if (!group) return null;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/groups')} sx={{ mb: 2 }}>
          Back to Groups
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {inviteSuccess && (
          <Alert severity="success" sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }} onClose={() => setInviteSuccess(null)}>
            {inviteSuccess}
          </Alert>
        )}

        <GroupHeader
          group={group}
          isAdmin={group.is_admin}
          onEdit={() => setEditDialogOpen(true)}
          onDelete={() => setDeleteDialogOpen(true)}
          onLeave={() => setLeaveDialogOpen(true)}
        />

        {group.is_admin && (
          <Box sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM }}>
            <InviteSection
              inviteCode={group.invite_code || ''}
              copied={copied}
              onCopyInviteCode={handleCopyInviteCode}
              onRegenerateInvite={handleRegenerateInvite}
              onOpenInviteDialog={() => setInviteDialogOpen(true)}
            />
          </Box>
        )}

        {group.is_admin && (
          <PendingInvites invites={invites} onResend={handleResendInvite} />
        )}

        <MembersList
          members={group.members}
          currentUserId={user.id}
          isAdmin={group.is_admin}
          onMemberMenuOpen={(anchor, member) => {
            setMemberMenuAnchor(anchor);
            setSelectedMember(member);
          }}
        />

        <MemberActionsMenu
          anchorEl={memberMenuAnchor}
          member={selectedMember}
          onClose={() => setMemberMenuAnchor(null)}
          onToggleAdmin={handleToggleAdmin}
          onRemoveMember={handleRemoveMember}
        />

        <EditGroupDialog
          open={editDialogOpen}
          editName={editName}
          submitting={submitting}
          onClose={() => setEditDialogOpen(false)}
          onNameChange={setEditName}
          onSave={handleUpdateGroup}
        />

        <DeleteGroupDialog
          open={deleteDialogOpen}
          groupName={group.name}
          submitting={submitting}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={handleDeleteGroup}
        />

        <LeaveGroupDialog
          open={leaveDialogOpen}
          groupName={group.name}
          submitting={submitting}
          onClose={() => setLeaveDialogOpen(false)}
          onLeave={handleLeaveGroup}
        />

        <InviteEmailDialog
          open={inviteDialogOpen}
          groupName={group.name}
          inviteEmail={inviteEmail}
          sendingInvite={sendingInvite}
          onClose={() => setInviteDialogOpen(false)}
          onEmailChange={setInviteEmail}
          onSendInvite={handleSendInvite}
        />
      </Box>
    </Container>
  );
}
