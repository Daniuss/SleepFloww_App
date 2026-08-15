import { create } from 'zustand';
import type { Night } from '../types/domain';
import { fetchNights as fetchNightsApi } from '../api/client';

type NightsStore = {
  nights: Night[];
  loading: boolean;
  error: string | null;
  fetchNights: (token: string) => Promise<void>;
};

export const useNightsStore = create<NightsStore>((set) => ({
  nights: [],
  loading: false,
  error: null,
  fetchNights: async (token) => {
    set({ loading: true, error: null });
    try {
      const nights = await fetchNightsApi(token);
      set({ nights, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar noites', loading: false });
    }
  },
}));
