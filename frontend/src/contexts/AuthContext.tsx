import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, User, ApiResponse } from '../services/api';
import { goalStorage } from '../services/goalStorage';
import { GoalInput } from '../types/goal';

interface ProfileData {
  name?: string;
  avatar_url?: string;
  password?: string;
  password_confirmation?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, passwordConfirmation: string, name?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function syncGuestGoals(): Promise<void> {
  const guestGoals = goalStorage.getAll();
  if (guestGoals.length === 0) return;

  const goalsToSync: GoalInput[] = guestGoals.map((g) => ({
    title: g.title,
    description: g.description || undefined,
    target_amount: g.target_amount,
    current_amount: g.current_amount,
    goal_type: g.goal_type,
    target_date: g.target_date || undefined,
    icon: g.icon || undefined,
    color: g.color || undefined,
  }));

  const response = await api.bulkCreateGoals(goalsToSync);
  if (!response.error) {
    goalStorage.clear();
  }
}

function handleAuthResponse(
  response: ApiResponse<{ user: User }>,
  setUser: (user: User | null) => void
): string | null {
  if (response.error) {
    return response.error;
  }
  if (response.data?.user) {
    setUser(response.data.user);
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const response = await api.getMe();
    if (response.data?.user) {
      setUser(response.data.user);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const response = await api.login(email, password);
    const error = handleAuthResponse(response, setUser);
    if (!error) {
      await syncGuestGoals();
    }
    return error;
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    passwordConfirmation: string,
    name?: string
  ): Promise<string | null> => {
    const response = await api.signup(email, password, passwordConfirmation, name);
    const error = handleAuthResponse(response, setUser);
    if (!error) {
      await syncGuestGoals();
    }
    return error;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: ProfileData): Promise<string | null> => {
    const response = await api.updateProfile(data);
    return handleAuthResponse(response, setUser);
  }, []);

  const value = { user, loading, login, signup, logout, updateProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
