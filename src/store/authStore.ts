import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthStore = {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  setSession: (session: Session | null) => void;
  setInitializing: (initializing: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  initializing: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitializing: (initializing) => set({ initializing }),
}));
