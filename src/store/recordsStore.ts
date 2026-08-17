import { create } from 'zustand';
import type { StoredManualRecord } from '../types/domain';
import { fetchRecords as fetchRecordsApi } from '../api/supabaseData';

type RecordsStore = {
  records: StoredManualRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: (userId: string) => Promise<void>;
};

export const useRecordsStore = create<RecordsStore>((set) => ({
  records: [],
  loading: false,
  error: null,
  fetchRecords: async (userId) => {
    set({ loading: true, error: null });
    try {
      const records = await fetchRecordsApi(userId);
      set({ records, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar registros', loading: false });
    }
  },
}));
