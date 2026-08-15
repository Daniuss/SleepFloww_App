import React from 'react';
import { Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { NightsBarChart } from '../components/NightsBarChart';
import { StatusBadge } from '../components/StatusBadge';
import { useTheme } from '../theme/ThemeProvider';
import { severityLabel } from '../data/mockNights';
import { partnerObservationLabel, sleepPositionLabel, symptomLabel } from '../data/recordLabels';
import { useNightsStore } from '../store/nightsStore';
import { useRecordsStore } from '../store/recordsStore';

export function HistoryScreen() {
  const { colors, spacing, typography } = useTheme();
  const { nights, loading: nightsLoading, error: nightsError } = useNightsStore();
  const { records, loading: recordsLoading, error: recordsError } = useRecordsStore();

  const totalEvents = nights.reduce((sum, n) => sum + n.eventsCount, 0);
  const avgEvents = nights.length > 0 ? totalEvents / nights.length : 0;

  return (
    <ScreenContainer>
      <SectionTitle>Histórico</SectionTitle>

      {nightsLoading ? (
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          {nightsError ? nightsError : 'Carregando histórico...'}
        </Text>
      ) : nights.length === 0 ? (
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          Nenhuma noite gravada ainda. Grave uma noite na tela inicial para começar o histórico.
        </Text>
      ) : (
        <>
          <Card>
            <Text style={[typography.subtitle, { color: colors.primaryInk }]}>
              Eventos respiratórios por noite
            </Text>
            <NightsBarChart nights={nights} />
            <Text style={[typography.caption, { color: colors.mutedInk }]}>
              Média dos últimos {nights.length} dias: {avgEvents.toFixed(1)} eventos por noite.
            </Text>
          </Card>

          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Noites recentes</Text>
            {[...nights].reverse().map((night) => (
              <Card key={night.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ gap: 4 }}>
                  <Text style={[typography.body, { color: colors.primaryInk }]}>{night.date}</Text>
                  <Text style={[typography.caption, { color: colors.secondaryInk }]}>
                    {night.eventsCount} eventos · {night.snoreMinutes} min de ronco ·{' '}
                    {night.sleepDurationHours.toFixed(1)}h de sono
                  </Text>
                </View>
                <StatusBadge severity={night.severity} label={severityLabel(night.severity)} />
              </Card>
            ))}
          </View>
        </>
      )}

      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Registros manuais</Text>
        {recordsLoading ? (
          <Text style={[typography.body, { color: colors.secondaryInk }]}>
            {recordsError ? recordsError : 'Carregando registros...'}
          </Text>
        ) : records.length === 0 ? (
          <Text style={[typography.body, { color: colors.secondaryInk }]}>
            Nenhum registro manual salvo ainda. Preencha um na aba "Registro".
          </Text>
        ) : (
          [...records].reverse().map((record) => {
            const details = [
              ...record.symptoms.map(symptomLabel),
              ...record.partnerObservations.map(partnerObservationLabel),
              record.sleepPosition ? sleepPositionLabel(record.sleepPosition) : null,
              record.usedCpap ? 'Usou CPAP' : null,
            ].filter((v): v is string => Boolean(v));

            return (
              <Card key={record.id} style={{ gap: 4 }}>
                <Text style={[typography.body, { color: colors.primaryInk }]}>{record.date}</Text>
                <Text style={[typography.caption, { color: colors.secondaryInk }]}>
                  {details.length > 0 ? details.join(' · ') : 'Sem sintomas ou observações marcadas'}
                </Text>
                {record.notes.length > 0 && (
                  <Text style={[typography.caption, { color: colors.mutedInk }]}>"{record.notes}"</Text>
                )}
              </Card>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
}
