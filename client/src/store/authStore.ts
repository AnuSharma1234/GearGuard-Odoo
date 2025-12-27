import { create } from 'zustand';
import { User } from '@/types/users';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      auth.setUser(user);
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      auth.setToken(response.access_token);
      const userResponse = await apiClient.getCurrentUser();
      const user = userResponse as User;
      set({ user, isAuthenticated: true });
      auth.setUser(user);
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    auth.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = auth.getToken();
    const cachedUser = auth.getUser();

    // Fast path: if we already have a stored user and token (test mode), trust it
    if (token && cachedUser) {
      set({ user: cachedUser, isAuthenticated: true, isLoading: false });
      return;
    }

    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const user = await apiClient.getCurrentUser();
      set({ user: user as User, isAuthenticated: true, isLoading: false });
      auth.setUser(user as User);
    } catch (error) {
      auth.removeToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

