import { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface TipsSectionProps {
  tips: string[];
}

export default function TipsSection({ tips }: TipsSectionProps) {
  const [showTips, setShowTips] = useState(false);

  if (tips.length === 0) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setShowTips(!showTips);
        }}
        endIcon={showTips ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ textTransform: 'none', p: 0 }}
      >
        {showTips ? 'Hide tips' : 'Show tips'}
      </Button>
      <Collapse in={showTips}>
        <List dense sx={{ mt: 1 }}>
          {tips.map((tip, index) => (
            <ListItem key={index} sx={{ py: 0, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary={tip}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
