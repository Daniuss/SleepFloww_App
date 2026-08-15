import type { PartnerObservationKey, SleepPosition, SymptomKey } from '../types/domain';

export const SYMPTOMS: { key: SymptomKey; label: string }[] = [
  { key: 'dor_de_cabeca', label: 'Dor de cabeça' },
  { key: 'boca_seca', label: 'Boca seca' },
  { key: 'cansaco', label: 'Cansaço' },
  { key: 'sono_nao_reparador', label: 'Sono não reparador' },
  { key: 'sonolencia_diurna', label: 'Sonolência durante o dia' },
];

export const PARTNER_OBSERVATIONS: { key: PartnerObservationKey; label: string }[] = [
  { key: 'ronco', label: 'Ronco' },
  { key: 'pausas_respiratorias', label: 'Pausas na respiração' },
  { key: 'engasgos', label: 'Engasgos' },
  { key: 'respiracao_irregular', label: 'Respiração irregular' },
];

export const SLEEP_POSITIONS: { key: SleepPosition; label: string }[] = [
  { key: 'costas', label: 'De costas' },
  { key: 'lado', label: 'De lado' },
  { key: 'barriga', label: 'De barriga' },
  { key: 'variou', label: 'Variou' },
];

function labelFor(list: { key: string; label: string }[], key: string): string {
  return list.find((item) => item.key === key)?.label ?? key;
}

export function symptomLabel(key: SymptomKey): string {
  return labelFor(SYMPTOMS, key);
}

export function partnerObservationLabel(key: PartnerObservationKey): string {
  return labelFor(PARTNER_OBSERVATIONS, key);
}

export function sleepPositionLabel(key: SleepPosition): string {
  return labelFor(SLEEP_POSITIONS, key);
}
