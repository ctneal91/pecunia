import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';

interface LoginFormValues {
  email: string;
  password: string;
}

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const { values, error, loading, handleChange, handleSubmit } = useForm({
    initialValues: INITIAL_VALUES,
    onSubmit: async ({ email, password }) => {
      const err = await login(email, password);
      if (!err) {
        navigate(redirectTo);
      }
      return err;
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Log In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={values.email}
              onChange={handleChange('email')}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={values.password}
              onChange={handleChange('password')}
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
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </Box>

          <Typography align="center">
            Don't have an account?{' '}
            <Link component={RouterLink} to={redirectTo !== '/' ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register'}>
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
