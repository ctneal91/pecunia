import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { theme } from './config/theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import GoalForm from './pages/GoalForm';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <GoalsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="profile" element={<Profile />} />
                <Route path="goals" element={<Goals />} />
                <Route path="goals/new" element={<GoalForm />} />
                <Route path="goals/:id/edit" element={<GoalForm />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </GoalsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
