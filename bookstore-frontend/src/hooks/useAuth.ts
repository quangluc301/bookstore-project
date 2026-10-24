import { create } from 'zustand';

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
};

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user, token = null) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
