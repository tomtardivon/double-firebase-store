import { create } from 'zustand';
import { User } from 'firebase/auth';
import { signIn, signUp, signOut, resetPassword } from '@/lib/firebase/auth';
import { SmarTeenUser } from '@/types';

interface AuthState {
  user: User | null;
  smarteenUser: SmarTeenUser | null;
  isAuthenticated: boolean;
  isShopAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  setUser: (user: User | null, isShopAuthenticated: boolean) => void;
  setSmartteenUser: (user: SmarTeenUser | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  smarteenUser: null,
  isAuthenticated: false,
  isShopAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signIn(email, password);
      set({ 
        user, 
        isAuthenticated: true,
        isShopAuthenticated: true,
        isLoading: false 
      });
      return user;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur de connexion',
        isLoading: false 
      });
      throw error;
    }
  },
  
  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signUp(email, password);
      set({ 
        user, 
        isAuthenticated: true,
        isShopAuthenticated: true,
        isLoading: false 
      });
      return user;
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur d\'inscription',
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut();
      set({ 
        user: null, 
        smarteenUser: null,
        isAuthenticated: false,
        isShopAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur de déconnexion',
        isLoading: false 
      });
    }
  },
  
  resetUserPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await resetPassword(email);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur réinitialisation mot de passe',
        isLoading: false 
      });
      throw error;
    }
  },
  
  setUser: (user: User | null, isShopAuthenticated: boolean) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      isShopAuthenticated 
    });
  },
  
  setSmartteenUser: (user: SmarTeenUser | null) => {
    set({ smarteenUser: user });
  },
  
  clearError: () => set({ error: null })
}));