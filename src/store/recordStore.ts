import { create } from 'zustand';
import type { ManualRecord, PartnerObservationKey, SleepPosition, SymptomKey } from '../types/domain';

type RecordStore = {
  draft: ManualRecord;
  toggleSymptom: (key: SymptomKey) => void;
  togglePartnerObservation: (key: PartnerObservationKey) => void;
  setHabit: (key: 'usedAlcohol' | 'usedCaffeine' | 'tookMedication', value: boolean) => void;
  setSleepPosition: (position: SleepPosition) => void;
  setUsedCpap: (value: boolean) => void;
  setCpapDurationHours: (value: string) => void;
  setNotes: (value: string) => void;
  reset: () => void;
};

function emptyDraft(): ManualRecord {
  return {
    date: new Date().toISOString().slice(0, 10),
    symptoms: [],
    partnerObservations: [],
    usedAlcohol: false,
    usedCaffeine: false,
    tookMedication: false,
    sleepPosition: null,
    usedCpap: false,
    cpapDurationHours: '',
    notes: '',
  };
}

// Estado só em memória (sessão do app) — sem persistência local/nuvem por enquanto.
export const useRecordStore = create<RecordStore>((set) => ({
  draft: emptyDraft(),
  toggleSymptom: (key) =>
    set((state) => ({
      draft: {
        ...state.draft,
        symptoms: state.draft.symptoms.includes(key)
          ? state.draft.symptoms.filter((s) => s !== key)
          : [...state.draft.symptoms, key],
      },
    })),
  togglePartnerObservation: (key) =>
    set((state) => ({
      draft: {
        ...state.draft,
        partnerObservations: state.draft.partnerObservations.includes(key)
          ? state.draft.partnerObservations.filter((s) => s !== key)
          : [...state.draft.partnerObservations, key],
      },
    })),
  setHabit: (key, value) => set((state) => ({ draft: { ...state.draft, [key]: value } })),
  setSleepPosition: (position) => set((state) => ({ draft: { ...state.draft, sleepPosition: position } })),
  setUsedCpap: (value) => set((state) => ({ draft: { ...state.draft, usedCpap: value } })),
  setCpapDurationHours: (value) => set((state) => ({ draft: { ...state.draft, cpapDurationHours: value } })),
  setNotes: (value) => set((state) => ({ draft: { ...state.draft, notes: value } })),
  reset: () => set({ draft: emptyDraft() }),
}));
