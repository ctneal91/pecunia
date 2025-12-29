import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { GroupWithMembers, Membership, GroupInvite } from '../types/group';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (group?.is_admin && id) {
      loadInvites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">Please log in to view group details.</Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </Box>
      </Container>
    );
  }

  if (error && !group) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/groups')} sx={{ mb: 2 }}>
            Back to Groups
          </Button>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!group) return null;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/groups')} sx={{ mb: 2 }}>
          Back to Groups
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {inviteSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInviteSuccess(null)}>
            {inviteSuccess}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1">
                {group.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.member_count} {group.member_count === 1 ? 'member' : 'members'} · {group.goal_count} {group.goal_count === 1 ? 'goal' : 'goals'}
              </Typography>
            </Box>
            <Box>
              {group.is_admin ? (
                <>
                  <IconButton onClick={() => setEditDialogOpen(true)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <Button
                  color="error"
                  startIcon={<ExitToAppIcon />}
                  onClick={() => setLeaveDialogOpen(true)}
                >
                  Leave Group
                </Button>
              )}
            </Box>
          </Box>

          {group.is_admin && (
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Invite Members
                </Typography>
                <Button
                  size="small"
                  startIcon={<EmailIcon />}
                  onClick={() => setInviteDialogOpen(true)}
                >
                  Send Email Invite
                </Button>
              </Box>

              {group.invite_code && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Invite code:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {group.invite_code}
                    </Typography>
                    <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                      <IconButton onClick={handleCopyInviteCode} size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Generate new code">
                      <IconButton onClick={handleRegenerateInvite} size="small">
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Share this code or send an email invite to add people to your group.
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Paper>

        {/* Pending Invites */}
        {group.is_admin && invites.filter(i => i.status === 'pending').length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Invites
            </Typography>
            <List dense>
              {invites.filter(i => i.status === 'pending').map((invite) => (
                <ListItem key={invite.id}>
                  <ListItemText
                    primary={invite.email}
                    secondary={invite.expired ? 'Expired' : `Sent ${new Date(invite.invited_at).toLocaleDateString()}`}
                  />
                  <Button
                    size="small"
                    onClick={() => handleResendInvite(invite)}
                  >
                    Resend
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Members
          </Typography>
          <List>
            {group.members.map((member, index) => (
              <Box key={member.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={member.user_name}
                    secondary={member.user_email}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {member.role === 'admin' && (
                      <Chip label="Admin" size="small" color="primary" variant="outlined" />
                    )}
                    {group.is_admin && member.user_id !== user.id && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setMemberMenuAnchor(e.currentTarget);
                          setSelectedMember(member);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>

        {/* Member Actions Menu */}
        <Menu
          anchorEl={memberMenuAnchor}
          open={Boolean(memberMenuAnchor)}
          onClose={() => setMemberMenuAnchor(null)}
        >
          {selectedMember && (
            <>
              <MenuItem onClick={() => handleToggleAdmin(selectedMember)}>
                <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                {selectedMember.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </MenuItem>
              <MenuItem onClick={() => handleRemoveMember(selectedMember)} sx={{ color: 'error.main' }}>
                <PersonRemoveIcon sx={{ mr: 1 }} />
                Remove from Group
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateGroup} variant="contained" disabled={submitting || !editName.trim()}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Group?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{group.name}"? This will remove all members and unassign all goals from this group. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteGroup} color="error" variant="contained" disabled={submitting}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Leave Dialog */}
        <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
          <DialogTitle>Leave Group?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to leave "{group.name}"? You will no longer have access to shared goals.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLeaveGroup} color="error" variant="contained" disabled={submitting}>
              Leave
            </Button>
          </DialogActions>
        </Dialog>

        {/* Email Invite Dialog */}
        <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Invite by Email</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Send an email invitation to join {group.name}. They'll receive a link to accept the invitation.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendInvite}
              variant="contained"
              disabled={sendingInvite || !inviteEmail.trim()}
              startIcon={<SendIcon />}
            >
              {sendingInvite ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
