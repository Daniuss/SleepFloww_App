import React from 'react';
import { Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { NightsBarChart } from '../components/NightsBarChart';
import { StatusBadge } from '../components/StatusBadge';
import { useTheme } from '../theme/ThemeProvider';
import { severityLabel } from '../data/mockNights';
import { useNightsStore } from '../store/nightsStore';

export function HistoryScreen() {
  const { colors, spacing, typography } = useTheme();
  const { nights, loading, error } = useNightsStore();

  if (loading) {
    return (
      <ScreenContainer>
        <SectionTitle>Histórico</SectionTitle>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          {error ? error : 'Carregando histórico...'}
        </Text>
      </ScreenContainer>
    );
  }

  if (nights.length === 0) {
    return (
      <ScreenContainer>
        <SectionTitle>Histórico</SectionTitle>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          Nenhuma noite gravada ainda. Grave uma noite na tela inicial para começar o histórico.
        </Text>
      </ScreenContainer>
    );
  }

  const totalEvents = nights.reduce((sum, n) => sum + n.eventsCount, 0);
  const avgEvents = totalEvents / nights.length;

  return (
    <ScreenContainer>
      <SectionTitle>Histórico</SectionTitle>

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
    </ScreenContainer>
  );
}
