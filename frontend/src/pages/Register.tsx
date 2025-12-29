import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '../hooks/useForm';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

const INITIAL_VALUES: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

function validatePasswords(values: RegisterFormValues): string | null {
  if (values.password !== values.passwordConfirmation) {
    return 'Passwords do not match';
  }
  return null;
}

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const { values, error, loading, handleChange, handleSubmit } = useForm({
    initialValues: INITIAL_VALUES,
    validate: validatePasswords,
    onSubmit: async ({ email, password, passwordConfirmation, name }) => {
      const err = await signup(email, password, passwordConfirmation, name || undefined);
      if (!err) {
        navigate('/');
      }
      return err;
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Sign Up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name (optional)"
              value={values.name}
              onChange={handleChange('name')}
              margin="normal"
              autoFocus
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={values.email}
              onChange={handleChange('email')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={values.password}
              onChange={handleChange('password')}
              margin="normal"
              required
              helperText="At least 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={values.passwordConfirmation}
              onChange={handleChange('passwordConfirmation')}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Box>

          <Typography align="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Log in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
