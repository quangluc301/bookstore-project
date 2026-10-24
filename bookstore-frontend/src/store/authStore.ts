import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'bookstore-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }) as AuthState,
    }
  )
);
