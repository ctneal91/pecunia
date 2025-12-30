import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  keyframes,
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { MILESTONE_MESSAGES } from '../../types/goal';

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

const confetti = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

interface MilestoneCelebrationProps {
  milestones: number[];
  goalTitle: string;
  onClose: () => void;
}

const MILESTONE_ICONS: Record<number, React.ReactNode> = {
  25: <CelebrationIcon sx={{ fontSize: 80, color: '#FFD700' }} />,
  50: <CelebrationIcon sx={{ fontSize: 80, color: '#FFA500' }} />,
  75: <CelebrationIcon sx={{ fontSize: 80, color: '#FF6347' }} />,
  100: <EmojiEventsIcon sx={{ fontSize: 80, color: '#FFD700' }} />,
};

const CONFETTI_COLORS = ['#FFD700', '#FF6347', '#32CD32', '#1E90FF', '#FF69B4', '#9370DB'];

function ConfettiPiece({ delay, left, color }: { delay: number; left: number; color: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: `${left}%`,
        width: 10,
        height: 10,
        backgroundColor: color,
        borderRadius: '50%',
        animation: `${confetti} 3s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

export default function MilestoneCelebration({
  milestones,
  goalTitle,
  onClose,
}: MilestoneCelebrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(true);

  const currentMilestone = milestones[currentIndex];
  const hasMore = currentIndex < milestones.length - 1;

  const handleNext = useCallback(() => {
    if (hasMore) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setOpen(false);
      onClose();
    }
  }, [hasMore, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, handleNext]);

  if (!currentMilestone) return null;

  return (
    <Dialog
      open={open}
      onClose={handleNext}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {[...Array(20)].map((_, i) => (
          <ConfettiPiece
            key={i}
            delay={Math.random() * 2}
            left={Math.random() * 100}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
          />
        ))}
        <DialogContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              animation: `${bounce} 1s ease-in-out`,
              mb: 2,
            }}
          >
            {MILESTONE_ICONS[currentMilestone]}
          </Box>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            {currentMilestone}% Milestone!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
            {goalTitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {MILESTONE_MESSAGES[currentMilestone]}
          </Typography>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {hasMore ? 'Next' : 'Continue'}
          </Button>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
