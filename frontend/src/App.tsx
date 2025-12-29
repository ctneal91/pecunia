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
import GoalDetail from './pages/GoalDetail';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import AcceptInvite from './pages/AcceptInvite';

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
                <Route path="goals/:id" element={<GoalDetail />} />
                <Route path="goals/:id/edit" element={<GoalForm />} />
                <Route path="groups" element={<Groups />} />
                <Route path="groups/:id" element={<GroupDetail />} />
                <Route path="invites/:token" element={<AcceptInvite />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </GoalsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
