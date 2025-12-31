import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { InviteDetails } from '../../types/group';
import {
  LoadingState,
  InvalidInviteState,
  InviteStatusState,
  AcceptedState,
  DeclinedState,
  UnauthenticatedInviteCard,
  InviteCard,
} from '../../components/AcceptInvite';

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
    return <LoadingState />;
  }

  if (error && !invite) {
    return <InvalidInviteState error={error} />;
  }

  if (!invite) return null;

  if (accepted) {
    return <AcceptedState groupName={invite.group_name} />;
  }

  if (declined) {
    return <DeclinedState groupName={invite.group_name} />;
  }

  if (invite.status !== 'pending') {
    return (
      <InviteStatusState
        status={invite.status as 'accepted' | 'expired' | 'declined'}
        groupName={invite.group_name}
      />
    );
  }

  if (invite.expired) {
    return (
      <InviteStatusState
        status="expired"
        groupName={invite.group_name}
        inviterName={invite.inviter_name}
      />
    );
  }

  if (!user) {
    return (
      <UnauthenticatedInviteCard
        groupName={invite.group_name}
        inviterName={invite.inviter_name}
        token={token!}
      />
    );
  }

  return (
    <InviteCard
      groupName={invite.group_name}
      inviterName={invite.inviter_name}
      submitting={submitting}
      error={error}
      onAccept={handleAccept}
      onDecline={handleDecline}
      onClearError={() => setError(null)}
    />
  );
}
