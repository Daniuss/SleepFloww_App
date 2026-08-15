import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import type { Night } from '../types/domain';
import { severityLabel } from '../data/mockNights';

function buildHtml(nights: Night[], email: string): string {
  const rows = nights
    .map(
      (night) => `
        <tr>
          <td>${night.date}</td>
          <td>${night.eventsCount}</td>
          <td>${night.snoreMinutes} min</td>
          <td>${night.sleepDurationHours.toFixed(1)}h</td>
          <td>${severityLabel(night.severity)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #0b0b0b; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p.meta { color: #52514e; font-size: 12px; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e1e0d9; font-size: 13px; }
          th { color: #52514e; font-weight: 600; }
          p.disclaimer { margin-top: 24px; font-size: 11px; color: #898781; }
        </style>
      </head>
      <body>
        <h1>SleepFlow — Relatório de noites</h1>
        <p class="meta">Conta: ${email} · Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Eventos</th>
              <th>Ronco</th>
              <th>Duração do sono</th>
              <th>Severidade</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p class="disclaimer">
          Este relatório é gerado a partir de uma heurística de volume de áudio, não é um
          diagnóstico médico. Consulte um profissional de saúde para avaliação de apneia do sono.
        </p>
      </body>
    </html>
  `;
}

export async function exportNightsReport(nights: Night[], email: string): Promise<void> {
  const html = buildHtml(nights, email);
  const { uri } = await Print.printToFileAsync({ html });
  await shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Exportar relatório do SleepFlow' });
}
