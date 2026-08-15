import type { Night } from '../types/domain';

// Uma amostra de nível de volume (dB) em um instante da gravação.
// timestampMs é relativo ao início da gravação (igual ao durationMillis do expo-audio).
export type MeteringSample = { timestampMs: number; dB: number };

export type NightSummary = Omit<Night, 'id'>;

// Limiares heurísticos, não clínicos — calibrar depois com uso real.
const SNORE_DB_THRESHOLD = -25; // acima disso, consideramos "som alto" (possível ronco)
const SNORE_MIN_DURATION_MS = 2000; // precisa sustentar por pelo menos 2s pra contar
const SILENCE_DB_THRESHOLD = -50; // abaixo disso, consideramos "silêncio"
const SILENCE_MIN_DURATION_MS = 10000; // silêncio de 10s+ é candidato a pausa respiratória
const GASP_DB_DELTA = 15; // salto de volume logo após o silêncio, indicando engasgo

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function severityFromEvents(eventsCount: number): Night['severity'] {
  if (eventsCount <= 4) return 'baixo';
  if (eventsCount <= 8) return 'moderado';
  return 'alto';
}

export function analyzeNight(samples: MeteringSample[], sessionStartedAt: Date): NightSummary {
  const date = sessionStartedAt.toISOString().slice(0, 10);
  const weekdayLabel = WEEKDAY_LABELS[sessionStartedAt.getDay()];

  if (samples.length === 0) {
    return { date, weekdayLabel, eventsCount: 0, snoreMinutes: 0, sleepDurationHours: 0, severity: 'baixo' };
  }

  const sorted = [...samples].sort((a, b) => a.timestampMs - b.timestampMs);

  let snoreMs = 0;
  let eventsCount = 0;

  let loudRunStart: number | null = null;
  let silenceRunStart: number | null = null;
  let lastSilenceSampleDb: number | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const sample = sorted[i];
    const isLoud = sample.dB >= SNORE_DB_THRESHOLD;
    const isSilent = sample.dB <= SILENCE_DB_THRESHOLD;

    // Rajada de ronco: soma a duração de cada trecho sustentado acima do limiar.
    if (isLoud) {
      if (loudRunStart === null) loudRunStart = sample.timestampMs;
    } else if (loudRunStart !== null) {
      const runDuration = sample.timestampMs - loudRunStart;
      if (runDuration >= SNORE_MIN_DURATION_MS) snoreMs += runDuration;
      loudRunStart = null;
    }

    // Pausa candidata: silêncio prolongado seguido de um salto de volume (engasgo).
    if (isSilent) {
      if (silenceRunStart === null) silenceRunStart = sample.timestampMs;
      lastSilenceSampleDb = sample.dB;
    } else {
      if (silenceRunStart !== null) {
        const silenceDuration = sample.timestampMs - silenceRunStart;
        const gasped = lastSilenceSampleDb !== null && sample.dB - lastSilenceSampleDb >= GASP_DB_DELTA;
        if (silenceDuration >= SILENCE_MIN_DURATION_MS && gasped) {
          eventsCount += 1;
        }
      }
      silenceRunStart = null;
      lastSilenceSampleDb = null;
    }
  }

  // Fecha uma rajada de ronco que ainda estava em curso no último sample.
  if (loudRunStart !== null) {
    const runDuration = sorted[sorted.length - 1].timestampMs - loudRunStart;
    if (runDuration >= SNORE_MIN_DURATION_MS) snoreMs += runDuration;
  }

  const totalDurationMs = sorted[sorted.length - 1].timestampMs - sorted[0].timestampMs;

  return {
    date,
    weekdayLabel,
    eventsCount,
    snoreMinutes: Math.round(snoreMs / 60000),
    sleepDurationHours: Math.round((totalDurationMs / 3600000) * 10) / 10,
    severity: severityFromEvents(eventsCount),
  };
}
