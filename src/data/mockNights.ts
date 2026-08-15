import type { Night } from '../types/domain';

// Dados fake só para termos algo na tela enquanto não existe backend/banco.
// Quando a captura de áudio e a API existirem, isso é trocado por dados reais.
export const mockNights: Night[] = [
  { id: 'n1', date: '2026-08-08', weekdayLabel: 'Sáb', eventsCount: 4, snoreMinutes: 22, sleepDurationHours: 7.2, severity: 'baixo' },
  { id: 'n2', date: '2026-08-09', weekdayLabel: 'Dom', eventsCount: 9, snoreMinutes: 41, sleepDurationHours: 6.5, severity: 'moderado' },
  { id: 'n3', date: '2026-08-10', weekdayLabel: 'Seg', eventsCount: 3, snoreMinutes: 15, sleepDurationHours: 7.8, severity: 'baixo' },
  { id: 'n4', date: '2026-08-11', weekdayLabel: 'Ter', eventsCount: 12, snoreMinutes: 58, sleepDurationHours: 6.1, severity: 'alto' },
  { id: 'n5', date: '2026-08-12', weekdayLabel: 'Qua', eventsCount: 7, snoreMinutes: 33, sleepDurationHours: 6.9, severity: 'moderado' },
  { id: 'n6', date: '2026-08-13', weekdayLabel: 'Qui', eventsCount: 2, snoreMinutes: 10, sleepDurationHours: 7.6, severity: 'baixo' },
  { id: 'n7', date: '2026-08-14', weekdayLabel: 'Sex', eventsCount: 6, snoreMinutes: 27, sleepDurationHours: 7.0, severity: 'moderado' },
];

export function severityLabel(severity: Night['severity']): string {
  switch (severity) {
    case 'baixo':
      return 'Poucos indícios';
    case 'moderado':
      return 'Indícios moderados';
    case 'alto':
      return 'Indícios elevados';
  }
}
