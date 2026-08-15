import { create } from 'zustand';
import type { StoredManualRecord } from '../types/domain';
import { fetchRecords as fetchRecordsApi } from '../api/client';

type RecordsStore = {
  records: StoredManualRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: (token: string) => Promise<void>;
};

export const useRecordsStore = create<RecordsStore>((set) => ({
  records: [],
  loading: false,
  error: null,
  fetchRecords: async (token) => {
    set({ loading: true, error: null });
    try {
      const records = await fetchRecordsApi(token);
      set({ records, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar registros', loading: false });
    }
  },
}));
