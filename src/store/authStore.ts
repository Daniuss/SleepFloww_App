import { create } from 'zustand';

type AuthStore = {
  token: string | null;
  email: string | null;
  setSession: (token: string, email: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  email: null,
  setSession: (token, email) => set({ token, email }),
  logout: () => set({ token: null, email: null }),
}));
