import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import { SPACING } from '../../constants/ui';

interface InviteSectionProps {
  inviteCode: string;
  copied: boolean;
  onCopyInviteCode: () => void;
  onRegenerateInvite: () => void;
  onOpenInviteDialog: () => void;
}

export default function InviteSection({
  inviteCode,
  copied,
  onCopyInviteCode,
  onRegenerateInvite,
  onOpenInviteDialog,
}: InviteSectionProps) {
  return (
    <Box sx={{ bgcolor: 'grey.100', p: SPACING.SECTION_MARGIN_BOTTOM_SMALL, borderRadius: SPACING.BUTTON_GAP }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING.BUTTON_GAP }}>
        <Typography variant="subtitle2" color="text.secondary">
          Invite Members
        </Typography>
        <Button
          size="small"
          startIcon={<EmailIcon />}
          onClick={onOpenInviteDialog}
        >
          Send Email Invite
        </Button>
      </Box>

      {inviteCode && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.BUTTON_GAP, mb: SPACING.BUTTON_GAP }}>
            <Typography variant="body2" color="text.secondary">
              Invite code:
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {inviteCode}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy'}>
              <IconButton onClick={onCopyInviteCode} size="small">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Generate new code">
              <IconButton onClick={onRegenerateInvite} size="small">
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
  );
}
