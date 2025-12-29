import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';

interface ProfileFormValues {
  name: string;
  avatarUrl: string;
  password: string;
  passwordConfirmation: string;
}

function validatePasswordMatch(values: ProfileFormValues): string | null {
  if (values.password && values.password !== values.passwordConfirmation) {
    return 'Passwords do not match';
  }
  return null;
}

function buildProfileData(values: ProfileFormValues) {
  const data: {
    name?: string;
    avatar_url?: string;
    password?: string;
    password_confirmation?: string;
  } = {
    name: values.name || undefined,
    avatar_url: values.avatarUrl || undefined,
  };

  if (values.password) {
    data.password = values.password;
    data.password_confirmation = values.passwordConfirmation;
  }

  return data;
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const initialValues: ProfileFormValues = {
    name: user?.name || '',
    avatarUrl: user?.avatar_url || '',
    password: '',
    passwordConfirmation: '',
  };

  const {
    values,
    error,
    success,
    loading,
    handleChange,
    handleSubmit,
    setSuccess,
    resetField,
  } = useForm({
    initialValues,
    validate: validatePasswordMatch,
    onSubmit: async (formValues) => {
      const data = buildProfileData(formValues);
      const err = await updateProfile(data);
      if (!err) {
        setSuccess('Profile updated successfully');
        resetField('password', '');
        resetField('passwordConfirmation', '');
      }
      return err;
    },
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user.email}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={values.name}
              onChange={handleChange('name')}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Avatar URL"
              value={values.avatarUrl}
              onChange={handleChange('avatarUrl')}
              margin="normal"
              helperText="URL to your profile picture"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Leave blank to keep current password
            </Typography>

            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={values.password}
              onChange={handleChange('password')}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={values.passwordConfirmation}
              onChange={handleChange('passwordConfirmation')}
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
