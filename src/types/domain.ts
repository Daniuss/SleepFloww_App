// Tipos do domínio do app. Nada aqui bate em backend — são os formatos que
// vamos usar para os dados mockados agora e para a API real mais adiante.

export type NightSeverity = 'baixo' | 'moderado' | 'alto';

export type Night = {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  weekdayLabel: string; // "Seg", "Ter"...
  eventsCount: number;
  snoreMinutes: number;
  sleepDurationHours: number;
  severity: NightSeverity;
};

export type SymptomKey =
  | 'dor_de_cabeca'
  | 'boca_seca'
  | 'cansaco'
  | 'sono_nao_reparador'
  | 'sonolencia_diurna';

export type PartnerObservationKey =
  | 'ronco'
  | 'pausas_respiratorias'
  | 'engasgos'
  | 'respiracao_irregular';

export type SleepPosition = 'costas' | 'lado' | 'barriga' | 'variou';

export type ManualRecord = {
  date: string;
  symptoms: SymptomKey[];
  partnerObservations: PartnerObservationKey[];
  usedAlcohol: boolean;
  usedCaffeine: boolean;
  tookMedication: boolean;
  sleepPosition: SleepPosition | null;
  usedCpap: boolean;
  cpapDurationHours: string;
  notes: string;
};

export type StoredManualRecord = ManualRecord & { id: string; createdAt: string };
