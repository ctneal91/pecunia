import { Menu, MenuItem } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Membership } from '../../types/group';
import { SPACING } from '../../constants/ui';

interface MemberActionsMenuProps {
  anchorEl: HTMLElement | null;
  member: Membership | null;
  onClose: () => void;
  onToggleAdmin: (member: Membership) => void;
  onRemoveMember: (member: Membership) => void;
}

export default function MemberActionsMenu({
  anchorEl,
  member,
  onClose,
  onToggleAdmin,
  onRemoveMember,
}: MemberActionsMenuProps) {
  if (!member) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
      />
    );
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem onClick={() => onToggleAdmin(member)}>
        <AdminPanelSettingsIcon sx={{ mr: SPACING.BUTTON_GAP }} />
        {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
      </MenuItem>
      <MenuItem onClick={() => onRemoveMember(member)} sx={{ color: 'error.main' }}>
        <PersonRemoveIcon sx={{ mr: SPACING.BUTTON_GAP }} />
        Remove from Group
      </MenuItem>
    </Menu>
  );
}
